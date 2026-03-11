import { Request, Response } from 'express';
import User from '../models/User';
import Look from '../models/Look';
import mongoose from 'mongoose';
import { createNotification } from '../utils/notificationUtils';

// @POST /api/users/saves/:lookId
// Toggle save a look for the current user
export const toggleSaveLook = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const lookIdStr = req.params.lookId as string;

        if (!mongoose.Types.ObjectId.isValid(lookIdStr)) {
            return res.status(400).json({ message: 'Invalid Look ID' });
        }

        const lookId = new mongoose.Types.ObjectId(lookIdStr);

        const look = await Look.findById(lookIdStr);
        if (!look) return res.status(404).json({ message: 'Look not found' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const hasSaved = user.savedLooks.some(id => id.toString() === lookIdStr);

        if (hasSaved) {
            // Unsave
            user.savedLooks = user.savedLooks.filter(id => id.toString() !== lookIdStr);
            const unSavedLook = await Look.findByIdAndUpdate(lookIdStr, { $inc: { savesCount: -1 } }, { returnDocument: 'after' });
            if (unSavedLook) {
                unSavedLook.trendingScore = Math.round(
                    ((unSavedLook.likesCount || 0) * 3 + Math.max(0, (unSavedLook.savesCount || 0)) * 2 + (unSavedLook.viewsCount || 0) * 0.1) * 10
                ) / 10;
                await unSavedLook.save();
            }
            await user.save();
            return res.json({ message: 'Look removed from saved', saved: false });
        } else {
            // Save
            user.savedLooks.push(lookId);
            const savedLook = await Look.findByIdAndUpdate(lookIdStr, { $inc: { savesCount: 1 } }, { returnDocument: 'after' });
            if (savedLook) {
                savedLook.trendingScore = Math.round(
                    ((savedLook.likesCount || 0) * 3 + (savedLook.savesCount || 0) * 2 + (savedLook.viewsCount || 0) * 0.1) * 10
                ) / 10;
                await savedLook.save();
            }
            await user.save();

            // Notify Look Owner (only if they are not saving their own look)
            await createNotification(
                look.sellerId,
                userId,
                'save',
                lookIdStr,
                `${user.name || 'Someone'} saved your look: ${look.title}`
            );

            return res.json({ message: 'Look saved successfully', saved: true });
        }
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @GET /api/users/saves
// Get all saved looks for the current user
export const getMySavedLooks = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        const user = await User.findById(userId).populate({
            path: 'savedLooks',
            populate: [
                {
                    path: 'sellerId',
                    select: 'name storeName profileImage isVerifiedSeller'
                },
                {
                    path: 'productsIncluded'
                }
            ]
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        return res.json(user.savedLooks);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @POST /api/users/follow/:id
// Toggle follow/unfollow a creator
export const toggleFollow = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const targetIdStr = req.params.id as string;

        if (!mongoose.Types.ObjectId.isValid(targetIdStr)) {
            return res.status(400).json({ message: 'Invalid User ID' });
        }

        if (userId === targetIdStr) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        const currentUser = await User.findById(userId);
        const targetUser = await User.findById(targetIdStr);

        if (!currentUser || !targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isFollowing = currentUser.following.some(id => id.toString() === targetIdStr);

        if (isFollowing) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => id.toString() !== targetIdStr);
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);

            await currentUser.save();
            await targetUser.save();

            return res.json({ message: 'Unfollowed successfully', following: false });
        } else {
            // Follow
            currentUser.following.push(new mongoose.Types.ObjectId(targetIdStr));
            targetUser.followers.push(new mongoose.Types.ObjectId(userId));

            await currentUser.save();
            await targetUser.save();

            // Notify Target User
            await createNotification(
                targetIdStr,
                userId,
                'follow',
                undefined,
                `${currentUser.name || 'Someone'} started following you!`
            );

            return res.json({ message: 'Followed successfully', following: true });
        }
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @GET /api/users/public/:id
// Get a public Creator Profile, including their followers and published Looks
export const getCreatorProfile = async (req: Request, res: Response) => {
    try {
        const targetIdStr = req.params.id as string;

        if (!mongoose.Types.ObjectId.isValid(targetIdStr)) {
            return res.status(400).json({ message: 'Invalid User ID' });
        }

        const user = await User.findById(targetIdStr).select('-passwordHash -email -savedLooks -role -createdAt -updatedAt -__v');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isCreator = user.storeName || user.bio; // Just a loose check to see if they are a styled profile

        // Get all Looks published by this creator
        const publishedLooks = await Look.find({ sellerId: targetIdStr })
            .populate('sellerId', 'name storeName profileImage isVerifiedSeller')
            .populate('productsIncluded')
            .sort({ createdAt: -1 });

        // Get all Products published by this seller
        const products = await mongoose.model('Product').find({ sellerId: targetIdStr, status: 'published' })
            .sort({ createdAt: -1 });

        return res.json({
            profile: {
                _id: user._id,
                name: user.name,
                storeName: user.storeName,
                profileImage: user.profileImage,
                bio: user.bio,
                isVerifiedSeller: user.isVerifiedSeller,
                followersCount: user.followers.length,
                followingCount: user.following.length,
            },
            looks: publishedLooks,
            products: products
        });

    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};
