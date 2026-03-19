import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Look from '../models/Look';
import User from '../models/User';
import Product from '../models/Product';
import { createNotification } from '../utils/notificationUtils';

// ─── Utility: recalculate trendingScore ──────────────────────────────────────
// Formula: (likes × 3) + (saves × 2) + (views × 0.1)
async function recalculateTrendingScore(lookId: string | mongoose.Types.ObjectId) {
    const look = await Look.findById(lookId);
    if (!look) return;
    const score = (look.likesCount || 0) * 3 + (look.savesCount || 0) * 2 + (look.viewsCount || 0) * 0.1;
    look.trendingScore = Math.round(score * 10) / 10;
    await look.save();
}

// @GET /api/looks — Public, supports filtering
export const getLooks = async (req: Request, res: Response) => {
    try {
        const { occasion, budgetRange, gender, sellerId, isInternal, page = 1, limit = 20 } = req.query;
        const filter: any = { status: 'published' };

        if (occasion) filter.occasion = { $in: [occasion] };
        if (budgetRange) filter.budgetRange = budgetRange;
        if (gender) filter.gender = gender;
        if (sellerId) filter.sellerId = sellerId;

        if (isInternal !== undefined) {
            filter.isInternal = isInternal === 'true';
        }

        const looks = await Look.find(filter)
            .populate('sellerId', 'name storeName profileImage isVerifiedSeller followers')
            .populate('productsIncluded.product')
            .sort({ isFeatured: -1, trendingScore: -1, createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await Look.countDocuments(filter);
        return res.json({ looks, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @GET /api/looks/feed/following — Protected
export const getFollowingFeed = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { page = 1, limit = 20 } = req.query;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const followingIds = user.following;
        const filter = { sellerId: { $in: followingIds }, status: 'published' };

        const looks = await Look.find(filter)
            .populate('sellerId', 'name storeName profileImage isVerifiedSeller followers')
            .populate('productsIncluded.product')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await Look.countDocuments(filter);
        return res.json({
            looks,
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            isFollowingSomeone: followingIds.length > 0
        });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @GET /api/looks/:id — Public
export const getLookById = async (req: Request, res: Response) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id as string)) {
            return res.status(404).json({ message: 'Look not found (invalid ID).' });
        }

        const look = await Look.findByIdAndUpdate(
            req.params.id,
            { $inc: { viewsCount: 1 } },
            { returnDocument: 'after' }
        )
            .populate('sellerId', 'name storeName profileImage isVerifiedSeller followers')
            .populate('productsIncluded.product');

        if (!look) return res.status(404).json({ message: 'Look not found.' });

        // Recalculate trendingScore in background (don't await to keep response fast)
        recalculateTrendingScore(String(req.params.id)).catch(console.error);

        return res.json(look);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @POST /api/looks — Admin only
// Creates an official look that appears directly in the Trending/Discover feed
export const createLook = async (req: Request, res: Response) => {
    try {
        const sellerId = (req as any).user.id;
        const look = await Look.create({
            ...req.body,
            sellerId,
            isInternal: true,
            status: 'published'
        });
        return res.status(201).json(look);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @PUT /api/looks/:id — Admin only
export const updateLook = async (req: Request, res: Response) => {
    try {
        const look = await Look.findById(req.params.id);
        if (!look) return res.status(404).json({ message: 'Look not found.' });

        const updated = await Look.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
        return res.json(updated);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @DELETE /api/looks/:id — Admin only
export const deleteLook = async (req: Request, res: Response) => {
    try {
        const look = await Look.findById(req.params.id);
        if (!look) return res.status(404).json({ message: 'Look not found.' });

        const user = (req as any).user;
        if (look.sellerId.toString() !== user.id && user.role !== 'admin')
            return res.status(403).json({ message: 'Not authorized.' });

        await look.deleteOne();
        return res.json({ message: 'Look removed.' });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @PATCH /api/looks/:id/feature — Admin only
// Toggles a look in/out of the Trending Discover feed
export const featureLook = async (req: Request, res: Response) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(String(req.params.id))) {
            return res.status(400).json({ message: 'Invalid look ID.' });
        }

        const look = await Look.findById(req.params.id);
        if (!look) return res.status(404).json({ message: 'Look not found.' });

        // Toggle: if currently featured, unfeature it; if not, feature it
        const newIsInternal = !look.isInternal;
        const newStatus = newIsInternal ? 'published' : 'draft';

        look.isInternal = newIsInternal;
        look.status = newStatus as 'published' | 'draft';
        await look.save();

        return res.json({
            message: newIsInternal ? 'Look featured in Trending feed.' : 'Look removed from Trending feed.',
            isInternal: look.isInternal,
            status: look.status,
            look
        });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @POST /api/looks/:id/like — Protected
export const toggleLikeLook = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const lookId = req.params.id as string;

        if (!mongoose.Types.ObjectId.isValid(lookId)) {
            return res.status(400).json({ message: 'Invalid look ID.' });
        }

        const look = await Look.findById(lookId);
        if (!look) return res.status(404).json({ message: 'Look not found.' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (!look.likes) look.likes = [];
        if (!user.likedLooks) user.likedLooks = [];

        const isLiked = look.likes.some(id => id.toString() === userId);

        if (isLiked) {
            look.likes = look.likes.filter(id => id.toString() !== userId);
            look.likesCount = Math.max(0, (look.likesCount || 1) - 1);
            user.likedLooks = user.likedLooks.filter(id => id.toString() !== lookId);
        } else {
            look.likes.push(new mongoose.Types.ObjectId(userId));
            look.likesCount = (look.likesCount || 0) + 1;
            user.likedLooks.push(new mongoose.Types.ObjectId(lookId));

            await createNotification(
                look.sellerId,
                userId,
                'like',
                lookId as string,
                `${user.name || 'Someone'} liked your look: ${look.title}`
            );
        }

        // Recalculate trendingScore using current (not yet saved) values
        look.trendingScore = Math.round(
            ((look.likesCount || 0) * 3 + (look.savesCount || 0) * 2 + (look.viewsCount || 0) * 0.1) * 10
        ) / 10;

        await look.save();
        await user.save();

        return res.json({
            message: isLiked ? 'Look unliked' : 'Look liked',
            likesCount: look.likesCount,
            isLiked: !isLiked,
            trendingScore: look.trendingScore
        });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @POST /api/looks/user-created — All authenticated users (sellers & regular users)
// Creates a personal look in draft state — does NOT appear in Trending until admin features it
export const createUserLook = async (req: Request, res: Response) => {
    try {
        console.log("Creating user look:", JSON.stringify(req.body, null, 2));
        const userId = (req as any).user.id;
        const look = await Look.create({
            ...req.body,
            sellerId: userId,
            isUserCreated: true,
            isInternal: false,
            status: req.body.status || 'draft'
        });
        return res.status(201).json(look);
    } catch (err: any) {
        console.error("User Look Creation Error:", err);
        return res.status(500).json({ message: err.message });
    }
};

// @GET /api/looks/my-outfits — Protected
export const getMyOutfits = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { page = 1, limit = 20 } = req.query;

        const filter = { sellerId: userId };

        const looks = await Look.find(filter)
            .populate('productsIncluded.product')
            .populate('sellerId', 'name storeName profileImage')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await Look.countDocuments(filter);
        return res.json({ looks, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @POST /api/looks/generate-ai — Authenticated users
export const generateLookAI = async (req: Request, res: Response) => {
    try {
        const { gender, occasion, budgetRange } = req.body;

        const categories = ['Top', 'Bottom', 'Footwear', 'Accessory'];

        const productsIncluded = await Promise.all(
            categories.map(async (cat) => {
                const filter: any = { category: cat, inStock: true };
                if (gender && gender !== 'unisex') filter.mainCategory = new RegExp(gender, 'i');

                const results = await Product.aggregate([
                    { $match: filter },
                    { $sample: { size: 1 } }
                ]);
                return results[0] || null;
            })
        );

        const validProducts = productsIncluded.filter(p => p !== null);

        if (validProducts.length === 0) {
            return res.status(404).json({ message: 'Could not generate a look with current filters.' });
        }

        const totalEstimatedBudget = validProducts.reduce((sum, p) => sum + p.price, 0);

        const lookData = {
            title: `AI Styled ${occasion || 'Daily'} Look`,
            description: `A custom curated ${occasion || 'stylish'} outfit generated just for you.`,
            imageUrl: validProducts[0].imageUrl,
            occasion: occasion ? [occasion] : ['daily'],
            budgetRange: budgetRange || 'mid-range',
            totalEstimatedBudget,
            gender: gender || 'unisex',
            productsIncluded: validProducts.map(p => p._id),
            isAiGenerated: true,
            isUserCreated: true,
            isInternal: false,
            status: req.body.status || 'draft',
            sellerId: (req as any).user.id
        };

        const look = await Look.create(lookData);
        const populatedLook = await Look.findById(look._id).populate('productsIncluded.product');

        return res.status(201).json(populatedLook);
    } catch (err: any) {
        console.error('AI Generation Error:', err);
        return res.status(500).json({ message: err.message });
    }
};
