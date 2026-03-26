import { Router, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { protect } from '../middlewares/auth';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import User from '../models/User';

const router = Router();
router.use(protect as any);

const razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const PLATFORM_FEE_PERCENT = 5; // 5% platform commission
const GST_PERCENT          = 18; // 18% GST on platform fee only

// ─── POST /api/orders/create-payment ────────────────────────────────────────
// Creates a Razorpay Order to initiate payment collection.
// Body: { addressId } — the buyer's saved address to ship to.
router.post('/create-payment', async (req: any, res: Response) => {
    try {
        const { addressId } = req.body;

        // 1. Fetch cart
        const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty.' });
        }

        // 2. Validate stock for each item
        for (const item of cart.items) {
            const product = await Product.findById(item.productId);
            if (!product || !product.inStock || product.stockQuantity < item.quantity) {
                return res.status(400).json({
                    message: `"${item.name}" is out of stock or has insufficient quantity.`
                });
            }
        }

        // 3. Calculate pricing
        const subtotal    = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
        const platformFee = Math.round(subtotal * PLATFORM_FEE_PERCENT / 100);
        const gst         = Math.round(platformFee * GST_PERCENT / 100);
        const total       = subtotal + platformFee + gst;

        // 4. Create Razorpay order
        const rzpOrder = await razorpay.orders.create({
            amount:   total * 100, // Razorpay expects paise
            currency: 'INR',
            receipt:  `receipt_${Date.now()}`,
            notes:    { buyerId: req.user.id, addressId },
        });

        return res.json({
            razorpayOrderId: rzpOrder.id,
            razorpayKeyId:   process.env.RAZORPAY_KEY_ID,
            pricing: { subtotal, platformFee, gst, total },
            items: cart.items,
        });
    } catch (err: any) {
        console.error('[ORDER_CREATE_ERROR]', err);
        return res.status(500).json({ message: err.message });
    }
});

// ─── POST /api/orders/verify-payment ────────────────────────────────────────
// Verifies Razorpay signature, creates Order, deducts stock.
// Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature, addressId }
router.post('/verify-payment', async (req: any, res: Response) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, addressId } = req.body;

        // 1. Verify signature
        const expectedSig = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex');

        if (expectedSig !== razorpaySignature) {
            return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
        }

        // 2. Load cart + user address
        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty. Cannot create order.' });
        }

        const user = await User.findById(req.user.id);
        const address = user?.addresses?.find(a => (a as any)._id.toString() === addressId);
        if (!address) return res.status(400).json({ message: 'Delivery address not found.' });

        // 3. Re-calculate total from cart (source of truth)
        const subtotal    = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
        const platformFee = Math.round(subtotal * PLATFORM_FEE_PERCENT / 100);
        const gst         = Math.round(platformFee * GST_PERCENT / 100);
        const total       = subtotal + platformFee + gst;

        // 4. Create order record          
        const order = await Order.create({
            buyerId: req.user.id,
            items:   cart.items,
            shippingAddress: {
                fullName: address.fullName,
                phone:    address.phone,
                line1:    address.line1,
                line2:    address.line2,
                pincode:  address.pincode,
                city:     address.city,
                state:    address.state,
            },
            pricing: { subtotal, platformFee, gst, total },
            status:  'confirmed',
            payment: {
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature,
                status: 'paid',
            },
        });

        // 5. Deduct stock
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stockQuantity: -item.quantity },
            });
            // Mark out of stock if quantity reaches 0
            const updated = await Product.findById(item.productId);
            if (updated && updated.stockQuantity <= 0) {
                await Product.findByIdAndUpdate(item.productId, { inStock: false, stockQuantity: 0 });
            }
        }

        // 6. Clear cart
        await Cart.findOneAndUpdate({ userId: req.user.id }, { items: [] });

        return res.json({ message: 'Payment successful. Order placed!', orderId: order._id });
    } catch (err: any) {
        console.error('[ORDER_VERIFY_ERROR]', err);
        return res.status(500).json({ message: err.message });
    }
});

// ─── GET /api/orders/my ─────────────────────────────────────────────────────
router.get('/my', async (req: any, res: Response) => {
    try {
        const orders = await Order.find({ buyerId: req.user.id }).sort({ createdAt: -1 });
        return res.json(orders);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
});

// ─── GET /api/orders/seller ──────────────────────────────────────────────────
// Returns all orders that contain at least one item from this seller.
router.get('/seller', async (req: any, res: Response) => {
    try {
        const orders = await Order.find({
            'items.sellerId': req.user.id
        }).sort({ createdAt: -1 });

        // Filter items to only show this seller's items in each order
        const filtered = orders.map(o => ({
            ...o.toObject(),
            items: o.items.filter(i => i.sellerId.toString() === req.user.id),
        }));

        return res.json(filtered);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
});

// ─── GET /api/orders/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req: any, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found.' });
        if (order.buyerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized.' });
        }
        return res.json(order);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
});

export default router;
