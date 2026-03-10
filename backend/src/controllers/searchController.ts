import { Request, Response } from 'express';
import Look from '../models/Look';
import User from '../models/User';
import Product from '../models/Product';

// @GET /api/search?q=query
// Global search across Looks, Creators, and Products
export const globalSearch = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;

        if (!query || query.trim().length === 0) {
            return res.json({ looks: [], creators: [], products: [] });
        }

        const regex = new RegExp(query, 'i'); // Case-insensitive search

        // 1. Search Looks (Title, Description, Occasion)
        const looksPromise = Look.find({
            $or: [
                { title: { $regex: regex } },
                { description: { $regex: regex } },
                { occasion: { $in: [regex] } }, // Assuming occasion is an array of strings
            ]
        })
            .populate('sellerId', 'name storeName profileImage isVerifiedSeller')
            .populate('productsIncluded')
            .sort({ trendingScore: -1 })
            .limit(10);

        // 2. Search Creators (Name, StoreName, Bio)
        const creatorsPromise = User.find({
            role: 'seller', // Only search for sellers/creators
            $or: [
                { name: { $regex: regex } },
                { storeName: { $regex: regex } },
                { bio: { $regex: regex } }
            ]
        })
            .select('-passwordHash -email -savedLooks')
            .limit(5);

        // 3. Search Products (Name, Brand, Description)
        const productsPromise = Product.find({
            $or: [
                { name: { $regex: regex } },
                { brand: { $regex: regex } },
                { description: { $regex: regex } }
            ]
        })
            .populate('sellerId', 'storeName name')
            .limit(10);

        // Execute all queries concurrently
        const [looks, creators, products] = await Promise.all([
            looksPromise,
            creatorsPromise,
            productsPromise
        ]);

        return res.json({
            looks,
            creators,
            products
        });

    } catch (err: any) {
        console.error("Search error:", err);
        return res.status(500).json({ message: "An error occurred during search." });
    }
};
