import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Look from '../models/Look';
import Product from '../models/Product';
import Comment from '../models/Comment';
import Notification from '../models/Notification';

// ─── GET /api/admin/stats ────────────────────────────────────────────────────
export const getPlatformStats = async (_req: express.Request, res: express.Response) => {
    try {
        const [totalUsers, totalLooks, totalProducts, totalSaves] = await Promise.all([
            User.countDocuments(),
            Look.countDocuments(),
            Product.countDocuments(),
            Look.aggregate([{ $group: { _id: null, total: { $sum: '$savesCount' } } }]),
        ]);

        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } },
        ]);

        // Last 7 days look publication activity
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentLooks = await Look.aggregate([
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json({
            totalUsers,
            totalLooks,
            totalProducts,
            totalSaves: totalSaves[0]?.total ?? 0,
            usersByRole,
            recentLooks,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

// ─── GET /api/admin/users ────────────────────────────────────────────────────
export const getAllUsers = async (req: express.Request, res: express.Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const role = req.query.role as string | undefined;
        const search = req.query.search as string | undefined;

        const filter: Record<string, unknown> = {};
        if (role) filter.role = role;
        if (search) filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-passwordHash -otp -otpExpires')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            User.countDocuments(filter),
        ]);

        res.json({ users, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

// ─── PUT /api/admin/users/:id/role ───────────────────────────────────────────
export const updateUserRole = async (req: express.Request, res: express.Response) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, select: '-passwordHash -otp -otpExpires' }
        );

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'Role updated', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating role' });
    }
};

// ─── DELETE /api/admin/users/:id ─────────────────────────────────────────────
export const deleteUser = async (req: express.Request, res: express.Response) => {
    console.log('>>> ADMIN_DELETE_USER_REQUEST:', req.params.id);
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            console.log(`ADMIN_DELETE_USER_FAIL: User not found ${userId}`);
            return res.status(404).json({ message: 'User not found' });
        }

        // 1. Delete the user
        await User.findByIdAndDelete(userId);

        // 2. Clean up their content & social references
        const cleanupResults = await Promise.allSettled([
            Look.deleteMany({ creatorId: userId }),
            Product.deleteMany({ ownerId: userId }),
            Comment.deleteMany({ user: userId }),
            Notification.deleteMany({ recipientId: userId }),
            Notification.deleteMany({ senderId: userId }),

            // Remove from social arrays of others
            User.updateMany({}, { $pull: { followers: userId, following: userId, savedLooks: userId, likedLooks: userId, savedProducts: userId, likedProducts: userId } }),

            // Remove from Look likes and decrement count
            Look.updateMany({ likes: userId }, { $pull: { likes: userId }, $inc: { likesCount: -1 } }),

            // Remove from Product likes and decrement count
            Product.updateMany({ likes: userId }, { $pull: { likes: userId }, $inc: { likesCount: -1 } }),
        ]);

        console.log(`ADMIN_DELETE_USER_SUCCESS: ${userId}`, {
            cleanup: cleanupResults.map(r => r.status)
        });

        res.json({ message: 'User and all associated data deleted successfully' });
    } catch (error) {
        console.error('ADMIN_DELETE_USER_ERROR:', error);
        res.status(500).json({ message: 'Server error deleting user' });
    }
};

// ─── GET /api/admin/looks ────────────────────────────────────────────────────
export const getAllLooks = async (req: express.Request, res: express.Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = req.query.search as string | undefined;

        const filter: Record<string, unknown> = {};
        if (search) filter.title = { $regex: search, $options: 'i' };

        const [looks, total] = await Promise.all([
            Look.find(filter)
                .populate('creatorId', 'name storeName profileImage')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Look.countDocuments(filter),
        ]);

        res.json({ looks, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching looks' });
    }
};

// ─── DELETE /api/admin/looks/:id ─────────────────────────────────────────────
export const deleteLook = async (req: express.Request, res: express.Response) => {
    console.log('>>> ADMIN_DELETE_LOOK_REQUEST:', req.params.id);
    try {
        const lookId = String(req.params.id);
        const look = await Look.findById(lookId);
        if (!look) {
            console.log(`ADMIN_DELETE_LOOK_FAIL: Look not found ${lookId}`);
            return res.status(404).json({ message: 'Look not found' });
        }

        // 1. Delete the look
        await Look.findByIdAndDelete(lookId);

        // 2. Cleanup references & associated data
        const cleanupResults = await Promise.allSettled([
            // Remove from User saves/likes
            User.updateMany(
                { $or: [{ savedLooks: lookId }, { likedLooks: lookId }] },
                { $pull: { savedLooks: new mongoose.Types.ObjectId(lookId), likedLooks: new mongoose.Types.ObjectId(lookId) } } as any
            ),
            // Delete associated comments
            Comment.deleteMany({ look: lookId })
        ]);

        console.log(`ADMIN_DELETE_LOOK_SUCCESS: ${lookId}`, {
            cleanup: cleanupResults.map(r => r.status)
        });

        res.json({ message: 'Look deleted successfully' });
    } catch (error) {
        console.error('ADMIN_DELETE_LOOK_ERROR:', error);
        res.status(500).json({ message: 'Server error deleting look' });
    }
};

// ─── PUT /api/admin/looks/:id ───────────────────────────────────────────────
export const updateLook = async (req: express.Request, res: express.Response) => {
    try {
        const { title, imageUrl, isInternal, status } = req.body;
        const update: Record<string, unknown> = {};
        if (title !== undefined) update.title = title;
        if (imageUrl !== undefined) update.imageUrl = imageUrl;
        if (isInternal !== undefined) update.isInternal = isInternal;
        if (status !== undefined) update.status = status;

        const look = await Look.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!look) return res.status(404).json({ message: 'Look not found' });
        res.json({ message: 'Look updated successfully', look });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating look' });
    }
};

// ─── PATCH /api/admin/looks/:id/feature ──────────────────────────────────────
export const featureLookAdmin = async (req: express.Request, res: express.Response) => {
    try {
        const look = await Look.findById(req.params.id);
        if (!look) return res.status(404).json({ message: 'Look not found' });

        const newIsFeatured = !look.isFeatured;
        look.isFeatured = newIsFeatured;
        await look.save();

        res.json({
            message: newIsFeatured ? '🔥 Look featured in the Main feed.' : 'Look un-featured.',
            isFeatured: look.isFeatured,
            status: look.status,
            look
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error featuring look' });
    }
};

// ─── GET /api/admin/products ─────────────────────────────────────────────────
export const getAllProducts = async (req: express.Request, res: express.Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const [products, total] = await Promise.all([
            Product.find()
                .populate('ownerId', 'name storeName')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Product.countDocuments(),
        ]);

        res.json({ products, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
};

// ─── DELETE /api/admin/products/:id ──────────────────────────────────────────
export const deleteProduct = async (req: express.Request, res: express.Response) => {
    console.log('>>> ADMIN_DELETE_PRODUCT_REQUEST:', req.params.id);
    try {
        const productId = String(req.params.id);
        const product = await Product.findById(productId);
        if (!product) {
            console.log(`ADMIN_DELETE_PRODUCT_FAIL: Product not found ${productId}`);
            return res.status(404).json({ message: 'Product not found' });
        }

        // 1. Delete the product
        await Product.findByIdAndDelete(productId);

        // 2. Cleanup references
        const cleanupResults = await Promise.allSettled([
            // Remove from Looks
            Look.updateMany(
                { "productsIncluded.product": new mongoose.Types.ObjectId(productId) } as any,
                { $pull: { productsIncluded: { product: new mongoose.Types.ObjectId(productId) } } }
            ),
            // Remove from User saves/likes
            User.updateMany(
                { $or: [{ savedProducts: new mongoose.Types.ObjectId(productId) }, { likedProducts: new mongoose.Types.ObjectId(productId) }] },
                { $pull: { savedProducts: new mongoose.Types.ObjectId(productId), likedProducts: new mongoose.Types.ObjectId(productId) } } as any
            )
        ]);

        console.log(`ADMIN_DELETE_PRODUCT_SUCCESS: ${productId}`, {
            cleanup: cleanupResults.map(r => r.status)
        });

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('ADMIN_DELETE_PRODUCT_ERROR:', error);
        res.status(500).json({ message: 'Server error deleting product' });
    }
};

// ─── PUT /api/admin/products/:id ────────────────────────────────────────────
export const updateProduct = async (req: express.Request, res: express.Response) => {
    try {
        const { name, imageUrl, price, salePrice, discountPercentage } = req.body;
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { name, imageUrl, price: Number(price), salePrice: Number(salePrice), discountPercentage: Number(discountPercentage) },
            { new: true }
        );
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product updated successfully', product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating product' });
    }
};

// ─── PATCH /api/admin/products/:id/publish ───────────────────────────────────
export const toggleProductPublish = async (req: express.Request, res: express.Response) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const newStatus = product.status === 'published' ? 'draft' : 'published';
        product.status = newStatus;
        await product.save();

        res.json({
            message: `Product ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`,
            status: product.status,
            product
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error toggling product status' });
    }
};

// ─── GET /api/admin/comments ────────────────────────────────────────────────
export const getAllComments = async (req: express.Request, res: express.Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        const [comments, total] = await Promise.all([
            Comment.find()
                .populate('user', 'name email profileImage')
                .populate('look', 'title imageUrl')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Comment.countDocuments(),
        ]);

        res.json({ comments, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching comments' });
    }
};

// ─── DELETE /api/admin/comments/:id ──────────────────────────────────────────
export const deleteComment = async (req: express.Request, res: express.Response) => {
    console.log('>>> ADMIN_DELETE_COMMENT_REQUEST:', req.params.id);
    try {
        const commentId = req.params.id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            console.log(`ADMIN_DELETE_COMMENT_FAIL: Comment not found ${commentId}`);
            return res.status(404).json({ message: 'Comment not found' });
        }

        // 1. Delete the main comment
        await Comment.findByIdAndDelete(commentId);

        // 2. Delete any replies (nested comments)
        const repliesDeleted = await Comment.deleteMany({ parentComment: commentId });

        console.log(`ADMIN_DELETE_COMMENT_SUCCESS: ${commentId}`, {
            repliesDeleted: repliesDeleted.deletedCount
        });

        res.json({
            message: 'Comment deleted successfully',
            repliesDeleted: repliesDeleted.deletedCount
        });
    } catch (error) {
        console.error('ADMIN_DELETE_COMMENT_ERROR:', error);
        res.status(500).json({ message: 'Server error deleting comment' });
    }
};

// ─── POST /api/admin/notifications/broadcast ────────────────────────────────
export const createBroadcastNotification = async (req: express.Request, res: express.Response) => {
    try {
        const { message, targetRole } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const validRoles = ['all', 'user'];
        const role = validRoles.includes(targetRole) ? targetRole : 'all';

        // Find all users matching the target role (or all users)
        const filter = role === 'all' ? {} : { role };
        const users = await User.find(filter).select('_id');

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found for target role' });
        }

        // Create notification objects for bulk insert
        // senderId will be the admin's ID (which is in req.user from auth middleware)
        // @ts-ignore - req.user exists from protect middleware
        const adminId = req.user.id;

        const notifications = users.map(u => ({
            recipientId: u._id,
            senderId: adminId,
            type: 'broadcast',
            message: message,
            targetRole: role,
            isRead: false
        }));

        await Notification.insertMany(notifications);

        res.status(201).json({
            message: `Successfully broadcasted to ${notifications.length} users`,
            count: notifications.length
        });
    } catch (error) {
        console.error('Error creating broadcast:', error);
        res.status(500).json({ message: 'Server error creating broadcast notification' });
    }
};
