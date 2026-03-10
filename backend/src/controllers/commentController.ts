import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Look from '../models/Look';
import Notification from '../models/Notification';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
    user?: any;
}

// @desc    Get all comments for a specific look
// @route   GET /api/looks/:id/comments
// @access  Public
export const getCommentsByLook = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Fetch all comments for this look, sorted from newest to oldest
        const comments = await Comment.find({ look: id })
            .populate('user', 'name profileImage storeName')
            .sort({ createdAt: -1 });

        res.status(200).json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Server error fetching comments' });
    }
};

// @desc    Add a comment or reply to a look
// @route   POST /api/looks/:id/comments
// @access  Private
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { content, parentComment } = req.body;

        if (!req.user) {
            res.status(401).json({ message: 'Not authorized' });
            return;
        }

        if (!content || content.trim().length === 0) {
            res.status(400).json({ message: 'Comment content is required' });
            return;
        }

        // Verify the look exists
        const look = await Look.findById(id);
        if (!look) {
            res.status(404).json({ message: 'Look not found' });
            return;
        }

        // Output sanitization and creation
        const newComment = new Comment({
            content: content.trim(),
            user: req.user.id, // JWT sets it as .id
            look: id,
            parentComment: parentComment || null,
        });
        const comment = await newComment.save();
        if (!comment) {
            res.status(500).json({ message: 'Failed to save comment' });
            return;
        }

        // We fetch it again immediately to populate the user details for the frontend to render immediately
        await comment.populate('user', 'name profileImage storeName');

        // Notify Look Owner (if it's a top-level comment) or Parent Comment Owner (if it's a reply)
        if (parentComment) {
            const parent = await Comment.findById(parentComment);
            if (parent && parent.user.toString() !== req.user.id) {
                await Notification.create({
                    recipientId: parent.user,
                    senderId: new mongoose.Types.ObjectId(req.user.id),
                    type: 'comment',
                    relatedLookId: new mongoose.Types.ObjectId(id as string),
                    message: 'replied to your comment'
                });
            }
        } else if (look.sellerId.toString() !== req.user.id) {
            await Notification.create({
                recipientId: look.sellerId,
                senderId: new mongoose.Types.ObjectId(req.user.id),
                type: 'comment',
                relatedLookId: new mongoose.Types.ObjectId(id as string),
                message: 'commented on your look'
            });
        }

        res.status(201).json(comment);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Server error adding comment' });
    }
};
