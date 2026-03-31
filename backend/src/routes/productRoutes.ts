import { Router, Request, Response } from 'express';
import { protect, authorize } from '../middlewares/auth';
import Product from '../models/Product';
import User from '../models/User';
import mongoose from 'mongoose';

const router = Router();

// ─── Utility: recalculateProductRating ──────────────────────────────────────
// Formula: Rating = Math.min(5, 3.5 + ((Likes*3 + Saves*5 + Shares*2 + Views*0.1) / 100))
async function recalculateProductRating(productId: string | mongoose.Types.ObjectId) {
    const product = await Product.findById(productId);
    if (!product) return;

    const engagementScore =
        (product.likesCount || 0) * 3 +
        (product.savesCount || 0) * 5 +
        (product.sharesCount || 0) * 2 +
        (product.viewsCount || 0) * 0.1;

    const calculatedRating = 3.5 + (engagementScore / 100);
    product.averageRating = Math.min(5, Math.round(calculatedRating * 10) / 10);

    // Slightly increment mock review count to reflect "activity"
    if (Math.random() > 0.7) {
        product.reviewCount = (product.reviewCount || 0) + 1;
    }

    await product.save();
}

// @POST /api/products/:id/toggle-like — Protected
router.post('/:id/toggle-like', protect as any, async (req: any, res: Response) => {
    try {
        const productId = req.params.id;
        const userId = req.user.id;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found.' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const currentLikes = product.likes || [];
        const isLiked = currentLikes.some(id => id.toString() === userId.toString());

        if (isLiked) {
            // Unlike: Atomic operations
            await Product.findByIdAndUpdate(productId, {
                $pull: { likes: new mongoose.Types.ObjectId(userId) } as any,
                $inc: { likesCount: -1 } as any
            });
            await User.findByIdAndUpdate(userId, {
                $pull: { likedProducts: new mongoose.Types.ObjectId(productId) } as any
            });
        } else {
            // Like: Atomic operations
            await Product.findByIdAndUpdate(productId, {
                $addToSet: { likes: new mongoose.Types.ObjectId(userId) } as any,
                $inc: { likesCount: 1 } as any
            });
            await User.findByIdAndUpdate(userId, {
                $addToSet: { likedProducts: new mongoose.Types.ObjectId(productId) } as any
            });
        }

        const updatedProduct = await Product.findById(productId);
        const finalLikesCount = Math.max(0, updatedProduct?.likesCount || 0);

        // Recalculate rating in background
        recalculateProductRating(productId).catch(console.error);

        return res.json({
            message: isLiked ? 'Unliked product' : 'Liked product',
            likesCount: finalLikesCount,
            isLiked: !isLiked
        });
    } catch (err: any) {
        console.error('[LIKE_ERROR]', err);
        return res.status(500).json({ message: err.message });
    }
});

// @GET /api/products — Public
router.get('/', async (req: Request, res: Response) => {
    const { ownerId, category, inStock, minPrice, maxPrice, q, mainCategory, subCategory, productType } = req.query;
    const filter: any = { status: 'published' };
    if (ownerId) filter.ownerId = ownerId;
    if (category) filter.category = category;
    if (mainCategory) {
        const mc = (mainCategory as string).trim();
        filter.mainCategory = { $regex: new RegExp(`^${mc}$`, 'i') };
    }
    if (subCategory) filter.subCategory = { $regex: new RegExp(subCategory as string, 'i') };
    if (productType) filter.productType = { $regex: new RegExp(productType as string, 'i') };
    if (inStock !== undefined) filter.inStock = inStock === 'true';
    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = Number(minPrice);
        if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (q) {
        const regex = new RegExp(q as string, 'i');
        filter.$or = [
            { name: { $regex: regex } },
            { brand: { $regex: regex } },
            { description: { $regex: regex } }
        ];
    }

    const products = await Product.find(filter)
        .populate('ownerId', 'name')
        .sort({ createdAt: -1 })
        .limit(20);
    return res.json(products);
});

// @GET /api/products/:id — Public
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const productId = req.params.id as string;
        const product = await Product.findOneAndUpdate(
            { _id: productId, status: 'published' },
            { $inc: { viewsCount: 1 } },
            { returnDocument: 'after' }
        ).populate('ownerId', 'name');

        if (!product) return res.status(404).json({ message: 'Product not found.' });

        // Recalculate rating in background
        recalculateProductRating(productId).catch(console.error);

        return res.json(product);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
});

// @POST /api/products/:id/toggle-save — Protected
router.post('/:id/toggle-save', protect as any, async (req: any, res: Response) => {
    try {
        const productId = req.params.id as string;
        const userId = req.user.id;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found.' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        const isSaved = user.savedProducts?.some(id => id.toString() === productId);

        if (isSaved) {
            await User.findByIdAndUpdate(userId, { $pull: { savedProducts: productId } });
            await Product.findByIdAndUpdate(productId, { $inc: { savesCount: -1 } });
        } else {
            await User.findByIdAndUpdate(userId, { $addToSet: { savedProducts: productId } });
            await Product.findByIdAndUpdate(productId, { $inc: { savesCount: 1 } });
        }

        recalculateProductRating(productId).catch(console.error);

        return res.json({
            message: isSaved ? 'Removed from saved' : 'Product saved',
            isSaved: !isSaved
        });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
});

// @POST /api/products/:id/share — Public
router.post('/:id/share', async (req: Request, res: Response) => {
    try {
        const productId = req.params.id as string;
        await Product.findByIdAndUpdate(productId, { $inc: { sharesCount: 1 } });

        recalculateProductRating(productId).catch(console.error);

        return res.json({ message: 'Share tracked' });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
});

// @POST /api/products — Admin only
router.post('/', protect as any, authorize('admin') as any, async (req: any, res: Response) => {
    const { 
        name, description, price, salePrice, discountPercentage, 
        currency, mainCategory, category, subCategory, productType, 
        listingType, stockQuantity, productUrl, imageUrl, 
        imageOriginal, imageTransparent, images, brand, attributes, inStock 
    } = req.body;

    const product = await Product.create({
        ownerId: req.user.id,
        name,
        description,
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : undefined,
        discountPercentage: discountPercentage ? Number(discountPercentage) : undefined,
        currency: currency || 'INR',
        mainCategory,
        category,
        subCategory,
        productType,
        listingType,
        stockQuantity: Number(stockQuantity),
        productUrl,
        imageUrl,
        imageOriginal,
        imageTransparent,
        images,
        brand,
        attributes,
        inStock,
        status: 'published' // Default to published for admin created products
    });

    return res.status(201).json(product);
});

// @PUT /api/products/:id — Admin only
router.put('/:id', protect as any, authorize('admin') as any, async (req: any, res: Response) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (product.ownerId.toString() !== req.user.id && req.user.role !== 'admin')
        return res.status(403).json({ message: 'Not authorized.' });
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    return res.json(updated);
});

// @DELETE /api/products/:id
router.delete('/:id', protect as any, authorize('admin') as any, async (req: any, res: Response) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (product.ownerId.toString() !== req.user.id && req.user.role !== 'admin')
        return res.status(403).json({ message: 'Not authorized.' });
    await product.deleteOne();
    return res.json({ message: 'Product deleted.' });
});

// @GET /api/products/:id/similar — Public
router.get('/:id/similar', async (req: Request, res: Response) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found.' });

        // Base filter: must be in stock and same gender (mainCategory)
        const baseFilter: any = {
            _id: { $ne: product._id },
            inStock: true,
            status: 'published',
        };

        if (product.mainCategory) {
            baseFilter.mainCategory = product.mainCategory;
        }

        // Level 1: Same Product Type + SubCategory (highest precision)
        let similar = await Product.find({
            ...baseFilter,
            productType: product.productType,
            subCategory: product.subCategory
        })
            .sort({ likesCount: -1 })
            .limit(8);

        // Level 2: Same Product Type only
        if (similar.length < 4) {
            const more = await Product.find({
                ...baseFilter,
                _id: { $ne: product._id, $nin: similar.map(p => p._id) },
                productType: product.productType
            })
                .sort({ likesCount: -1 })
                .limit(8 - similar.length);
            similar = [...similar, ...more];
        }

        // Level 3: Same SubCategory only
        if (similar.length < 4) {
            const more = await Product.find({
                ...baseFilter,
                _id: { $ne: product._id, $nin: similar.map(p => p._id) },
                subCategory: product.subCategory
            })
                .sort({ likesCount: -1 })
                .limit(8 - similar.length);
            similar = [...similar, ...more];
        }

        // Level 4: Same Category only
        if (similar.length < 2) {
            const more = await Product.find({
                ...baseFilter,
                _id: { $ne: product._id, $nin: similar.map(p => p._id) },
                category: product.category
            })
                .sort({ likesCount: -1 })
                .limit(8 - similar.length);
            similar = [...similar, ...more];
        }

        return res.json(similar);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
});


export default router;
