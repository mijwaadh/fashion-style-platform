import { Request, Response } from 'express';
import Look from '../models/Look';
import User from '../models/User';
import Product from '../models/Product';

// @GET /api/analytics/overview — Protected, Sellers only
export const getAnalyticsOverview = async (req: Request, res: Response) => {
    try {
        const sellerId = (req as any).user.id;

        // 1. Fetch the user to get their followers count
        const user = await User.findById(sellerId).select('followers');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const followerCount = user.followers.length;

        // 2. Fetch all looks published by this seller to aggregate statistics
        const looks = await Look.find({ sellerId })
            .select('title viewsCount savesCount createdAt imageUrl occasion budgetRange')
            .sort({ createdAt: -1 });

        const totalPublished = looks.length;

        // 3. Fetch all products published by this seller
        const products = await Product.find({ sellerId, status: 'published' })
            .select('name viewsCount savesCount createdAt imageUrl')
            .sort({ createdAt: -1 });

        const totalProducts = products.length;

        // Sum up total views and total saves across all looks
        const totalViews = looks.reduce((sum, look) => sum + (look.viewsCount || 0), 0);
        const totalSaves = looks.reduce((sum, look) => sum + (look.savesCount || 0), 0);

        // Sum up product views and saves
        const productViews = products.reduce((sum, product) => sum + (product.viewsCount || 0), 0);
        const productSaves = products.reduce((sum, product) => sum + (product.savesCount || 0), 0);

        // Sort looks by views (descending) to get top performers quickly
        const topLooks = [...looks].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)).slice(0, 5);

        return res.json({
            overview: {
                totalPublished, // Looks count
                totalProducts, // Products count
                totalViews: totalViews + productViews, // Combined views
                totalSaves: totalSaves + productSaves, // Combined saves
                followerCount
            },
            topLooks
        });
    } catch (err: any) {
        console.error("Analytics Error:", err);
        return res.status(500).json({ message: err.message });
    }
};
