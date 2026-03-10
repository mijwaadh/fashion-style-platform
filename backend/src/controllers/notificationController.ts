import { Request, Response } from 'express';
import Notification from '../models/Notification';

interface AuthRequest extends Request {
    user?: any;
}

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const notifications = await Notification.find({ recipientId: req.user?.id })
            .populate('senderId', 'name profileImage storeName')
            .populate('relatedLookId', 'title imageUrl')
            .sort({ createdAt: -1 })
            .limit(50); // limit to recent 50 for performance

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }

        // Verify ownership
        if (notification.recipientId.toString() !== req.user?.id.toString()) {
            res.status(403).json({ message: 'Not authorized' });
            return;
        }

        notification.isRead = true;
        await notification.save();

        res.json(notification);
    } catch (error) {
        console.error('Error marking notification read:', error);
        res.status(500).json({ message: 'Server error marking notification read' });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllNotificationsRead = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await Notification.updateMany(
            { recipientId: req.user?.id, isRead: false },
            { $set: { isRead: true } }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications read:', error);
        res.status(500).json({ message: 'Server error updating notifications' });
    }
};
