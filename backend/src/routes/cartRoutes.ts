import { Router, Response } from 'express';
import { protect } from '../middlewares/auth';
import Cart from '../models/Cart';
import Product from '../models/Product';

console.log('CART_ROUTER_INITIALIZING...');
const router = Router();

// All cart routes require authentication
router.use(protect as any);

// @GET /api/cart
router.get('/', async (req: any, res: Response) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id }) ?? { items: [] };
        return res.json(cart);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
});

// @POST /api/cart/add
router.post('/add', async (req: any, res: Response) => {
    try {
        const { productId, quantity = 1, size, color } = req.body;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found.' });
        if (product.listingType !== 'native') {
            return res.status(400).json({ message: 'Only native products can be added to cart.' });
        }
        if (!product.inStock || product.stockQuantity < 1) {
            return res.status(400).json({ message: 'Product is out of stock.' });
        }

        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [] });
        }

        const existing = cart.items.find(i => i.productId.toString() === productId && i.size === size && i.color === color);
        if (existing) {
            existing.quantity = Math.min(existing.quantity + quantity, product.stockQuantity);
        } else {
            cart.items.push({
                productId: product._id as any,
                sellerId:  product.sellerId as any,
                name:      product.name,
                imageUrl:  product.imageUrl,
                price:     product.price,
                quantity:  Math.min(quantity, product.stockQuantity),
                size,
                color,
            });
        }

        await cart.save();
        return res.json(cart);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
});

// @PUT /api/cart/update
router.put('/update', async (req: any, res: Response) => {
    try {
        const { productId, quantity, size, color } = req.body;
        if (quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1.' });

        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(404).json({ message: 'Cart not found.' });

        const item = cart.items.find(i => i.productId.toString() === productId && i.size === size && i.color === color);
        if (!item) return res.status(404).json({ message: 'Item not found in cart.' });

        const product = await Product.findById(productId);
        item.quantity = Math.min(quantity, product?.stockQuantity ?? quantity);

        await cart.save();
        return res.json(cart);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
});

// @DELETE /api/cart/remove/:productId
router.delete('/remove/:productId', async (req: any, res: Response) => {
    try {
        const { size, color } = req.query;
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(404).json({ message: 'Cart not found.' });

        cart.items = cart.items.filter(i =>
            !(i.productId.toString() === req.params.productId &&
              (!size || i.size === size) &&
              (!color || i.color === color))
        ) as any;

        await cart.save();
        return res.json(cart);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
});

// @DELETE /api/cart/clear
router.delete('/clear', async (req: any, res: Response) => {
    try {
        await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [] });
        return res.json({ message: 'Cart cleared.' });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
});

export default router;
