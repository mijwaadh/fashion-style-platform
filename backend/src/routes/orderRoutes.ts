import { Router, Response } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { protect } from '../middlewares/auth';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import User from '../models/User';

import { getCommissionRate } from '../utils/commissions';
import { createShiprocketOrder, assignAWB, getShippingLabel, trackShipment, addPickupLocation, getPickupLocations, checkServiceability, schedulePickup, generateManifest, printManifest, getShipmentTracking } from '../utils/shiprocket';

const router = Router();
router.use(protect as any);

const GST_PERCENT = 18; // 18% GST on platform fee only

// Helper to get Razorpay instance safely
const getRazorpay = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay API keys are not configured in environment variables.');
    }
    return new Razorpay({
        key_id:     process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

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

        // 3. Calculate pricing + Check Serviceability per seller
        let subtotal = 0;
        let platformFee = 0;
        const sellersSet = new Set<string>();

        for (const item of cart.items) {
            const product = item.productId as any;
            const itemTotal = item.price * item.quantity;
            const rate = getCommissionRate(product.category);
            
            subtotal += itemTotal;
            platformFee += Math.round(itemTotal * rate / 100);
            sellersSet.add(item.sellerId.toString());
        }

        const userAccount = await User.findById(req.user.id);
        const address = userAccount?.addresses?.find(a => (a as any)._id.toString() === addressId);
        if (!address) return res.status(400).json({ message: 'Delivery address not found.' });

        // Verify serviceability for each unique seller in the cart
        for (const sellerId of sellersSet) {
            const seller = await User.findById(sellerId);
            if (seller && seller.pickupAddress) {
                try {
                    const serviceability = await checkServiceability(
                        seller.pickupAddress.pincode,
                        address.pincode,
                        0.5 // Default weight for pre-check
                    );
                    const serviceableCouriers = 
                        serviceability?.data?.available_courier_companies || 
                        serviceability?.data?.courier_companies || [];
                    
                    if (!serviceability?.status || serviceableCouriers.length === 0) {
                        return res.status(400).json({ 
                            message: `Seller "${seller.name}" cannot ship to pincode ${address.pincode}. Please remove their items or choose another address.`,
                            sellerId 
                        });
                    }
                } catch (err: any) {
                    console.warn(`[CHECKOUT_SERVICEABILITY_WARN] Seller ${sellerId} check failed:`, err.message);
                    // If Shiprocket API is down, we might allow or block (user wanted strict, but we can't block if API is temporarily glitchy)
                    // For now, we block as per user's "STRICT" request.
                    return res.status(400).json({ message: `Logistics check failed for seller ${seller.name}.` });
                }
            }
        }

        const gst = Math.round(platformFee * GST_PERCENT / 100);
        const total = subtotal + platformFee + gst;

        // 4. Create Razorpay order
        const rzp = getRazorpay();
        const rzpOrder = await rzp.orders.create({
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
        if (!process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({ message: 'Payment config error: Missing RAZORPAY_KEY_SECRET' });
        }

        const expectedSig = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
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

        // 3. Re-calculate total from cart (Source of truth with dynamic rates)
        let subtotal = 0;
        let platformFee = 0;
        const itemsWithCommission = [];

        for (const item of cart.items) {
            const product = await Product.findById(item.productId);
            const rate = getCommissionRate(product?.category);
            const itemTotal = item.price * item.quantity;
            const commAmount = Math.round(itemTotal * rate / 100);
            
            subtotal += itemTotal;
            platformFee += commAmount;

            itemsWithCommission.push({
                productId:      item.productId,
                sellerId:       item.sellerId,
                name:           item.name,
                imageUrl:       item.imageUrl,
                price:          item.price,
                quantity:       item.quantity,
                size:           item.size,
                color:          item.color,
                commissionRate: rate,
                sellerShare:    itemTotal - commAmount
            });
        }

        const gst = Math.round(platformFee * GST_PERCENT / 100);
        const total = subtotal + platformFee + gst;

        // 4. Create order record          
        const order = await Order.create({
            buyerId: req.user.id,
            items:   itemsWithCommission,
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
            status:  'pending',
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

// ─── PUT /api/orders/:id/status ─────────────────────────────────────────────
// Update order status (Seller/Admin only)
router.put('/:id/status', protect as any, async (req: any, res: Response) => {
    try {
        const { status, courier, trackingId } = req.body;
        const order = await Order.findById(req.params.id);
        
        if (!order) return res.status(404).json({ message: 'Order not found.' });

        // Check if user is seller of at least one item in this order OR admin
        const isSeller = order.items.some(i => i.sellerId.toString() === req.user.id);
        const isAdmin = req.user.role === 'admin';

        if (!isSeller && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to update this order.' });
        }

        // Validate status transition
        const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status.' });
        }

        // Marketplace: Financial Settlement (T+7 System)
        // When marked as 'delivered', transfer funds to seller PENDING balances
        if (status === 'delivered' && order.status !== 'delivered') {
            console.log(`[SETTLEMENT] Initiating pending settlement for order ${order._id}...`);
            const now = new Date();
            for (const item of order.items) {
                if (item.sellerId && item.sellerShare) {
                    console.log(`[SETTLEMENT] Adding to pending balance for seller ${item.sellerId}: ₹${item.sellerShare}`);
                    
                    // 1. Update User: Add to pendingBalance and lifetimeEarnings
                    await User.updateOne(
                        { _id: item.sellerId },
                        { 
                            $inc: { 
                                pendingBalance: item.sellerShare,
                                lifetimeEarnings: item.sellerShare 
                            }
                        }
                    );

                    // 2. Update Order Item: Set deliveredAt
                    item.deliveredAt = now;
                    item.isSettled = false;
                } else {
                    console.warn(`[SETTLEMENT] Skipping item in order ${order._id}: missing sellerId or share.`, item);
                }
            }
        }
    

        if (status === 'shipped' && (courier || trackingId)) {
            // Update shipment info if provided
            const shipment = order.shipments?.find(s => s.sellerId.toString() === req.user.id);
            if (shipment) {
                if (courier) shipment.courier = courier;
                if (trackingId) shipment.trackingId = trackingId;
                if (!shipment.shippedAt) shipment.shippedAt = new Date();
            }
        }

        if (status) order.status = status;
        
        await order.save();
        return res.json(order);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
});

// ─── GET /api/orders/track/:awb ──────────────────────────────────────────────
// Proxies Shiprocket tracking data for the buyer (Public)
router.get('/track/:awb', async (req: any, res: Response) => {
    try {
        const trackingData = await trackShipment(req.params.awb);
        return res.json(trackingData);
    } catch (err: any) {
        console.error('[SHIPROCKET_TRACK_ERROR]', err.message);
        return res.status(500).json({ message: 'Tracking data unavailable.' });
    }
});

// ─── GET /api/orders/shiprocket/pickup-locations ────────────────────────────
// Fetches all available pickup locations from the Shiprocket account
router.get('/shiprocket/pickup-locations', async (req: any, res: Response) => {
    try {
        const locations = await getPickupLocations();
        return res.json(locations);
    } catch (err: any) {
        console.error('[SHIPROCKET_LOCATIONS_ERROR]', err.message);
        return res.status(500).json({ message: 'Failed to fetch pickup locations' });
    }
});

// ─── GET /api/orders/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req: any, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found.' });
        
        // Allow buyer, seller of an item, or admin
        const isBuyer = order.buyerId.toString() === req.user.id;
        const isSeller = order.items.some(i => i.sellerId.toString() === req.user.id);
        const isAdmin = req.user.role === 'admin';

        if (!isBuyer && !isSeller && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized.' });
        }
        return res.json(order);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
});

// ─── POST /api/orders/:id/confirm ───────────────────────────────────────────
// Confirms an order and creates it in Shiprocket (Seller only)
router.post('/:id/confirm', protect as any, async (req: any, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found.' });

        if (['cancelled', 'delivered'].includes(order.status)) {
            return res.status(400).json({ message: `Order is already ${order.status}.` });
        }

        // Check if this seller has already confirmed their portion
        const existingShipment = order.shipments?.find(s => s.sellerId.toString() === req.user.id);
        if (existingShipment) {
            return res.status(400).json({ message: 'You have already confirmed your items in this order.' });
        }

        // Check if this seller has items in this order
        const isSeller = order.items.some(i => i.sellerId.toString() === req.user.id);
        if (!isSeller) return res.status(403).json({ message: 'Unauthorized.' });

        const seller = await User.findById(req.user.id);
        if (!seller || !seller.pickupAddress) {
            return res.status(400).json({ message: 'Seller pickup address is missing. Please complete onboarding.' });
        }

        // 2. Format for Shiprocket (Only for this seller's items)
        const sellerItems = order.items.filter(i => i.sellerId.toString() === req.user.id);
        const sellerSubtotal = sellerItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const sellerWeight = sellerItems.reduce((sum, i) => sum + (0.5 * i.quantity), 0); // Assuming 0.5kg per item

        // Generate pickup location nickname from seller data
        const pickupLocationNickname = `${seller.name.replace(/\s+/g, '_')}_${seller._id.toString().slice(-6)}`;
        console.log(`[SHIPROCKET_DEBUG] Seller ${req.user.id} confirming order ${order._id} with pickup location: ${pickupLocationNickname}`);

        // 1. Check Serviceability
        try {
            const pickupPincode = seller.pickupAddress.pincode;
            const deliveryPincode = order.shippingAddress.pincode;
            const serviceability = await checkServiceability(pickupPincode, deliveryPincode, sellerWeight);

            // DEBUG: log Shiprocket serviceability payload
            console.log('[SHIPROCKET_SERVICEABILITY]', { pickupPincode, deliveryPincode, response: serviceability });

            const serviceableCouriers =
                serviceability?.data?.available_courier_companies ||
                serviceability?.data?.courier_companies ||
                [];

            const ok = serviceability?.status === true || serviceability?.status === 'success';

            // STRICT BLOCK: If no couriers found, block confirmation
            if (!ok || serviceableCouriers.length === 0) {
                return res.status(400).json({
                    message: `Pincode ${deliveryPincode} is not serviceable from your location (${pickupPincode}). Shiprocket returned no available couriers.`,
                    shiprocket: serviceability,
                });
            }
        } catch (servErr: any) {
            console.warn('[SERVICEABILITY_CHECK_FAILED]', servErr.response?.data || servErr.message);
            return res.status(400).json({
                message: 'Logistics serviceability check failed. Please verify your pickup address.',
                details: servErr.response?.data || servErr.message,
            });
        }

        const shiprocketPayload = {
            // Append seller ID to order ID to make it unique in Shiprocket for multi-seller orders
            order_id: `${order._id.toString()}_${req.user.id.slice(-6)}`,
            order_date: order.createdAt,
            pickup_location: pickupLocationNickname,
            billing_customer_name: order.shippingAddress.fullName,
            billing_last_name: ".", 
            billing_address: order.shippingAddress.line1,
            billing_address_2: order.shippingAddress.line2 || "",
            billing_city: order.shippingAddress.city,
            billing_pincode: order.shippingAddress.pincode,
            billing_state: order.shippingAddress.state,
            billing_country: "India",
            billing_email: "customer@aura.com",
            billing_phone: order.shippingAddress.phone,
            shipping_is_billing: 1,
            shipping_customer_name: order.shippingAddress.fullName,
            shipping_last_name: ".",
            shipping_address: order.shippingAddress.line1,
            shipping_address_2: order.shippingAddress.line2 || "",
            shipping_city: order.shippingAddress.city,
            shipping_pincode: order.shippingAddress.pincode,
            shipping_country: "India",
            shipping_state: order.shippingAddress.state,
            shipping_email: "customer@aura.com",
            shipping_phone: order.shippingAddress.phone,
            order_items: sellerItems.map(i => ({
                name: i.name,
                sku: i.productId.toString(),
                units: i.quantity,
                selling_price: i.price,
                discount: 0,
                tax: 0,
            })),
            payment_method: "Prepaid",
            shipping_charges: 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: 0,
            sub_total: sellerSubtotal,
            length: 10,
            breadth: 10,
            height: 10,
            weight: sellerWeight
        };

        // 3. Ensure Pickup Location exists in Shiprocket
        try {
            const pa = seller.pickupAddress!;
            await addPickupLocation({
                pickup_location: pickupLocationNickname,
                name: seller.name,
                email: seller.email,
                phone: pa.phone || "9999999999", 
                address: `${pa.room || ""}, ${pa.street || ""}`.trim().replace(/^, /, ""),
                address_2: pa.landmark || "",
                city: pa.city,
                state: pa.state,
                country: "India",
                pin_code: pa.pincode
            });
        } catch (pickupErr: any) {
            console.warn('[SHIPROCKET_PICKUP_WARN]', pickupErr.response?.data || pickupErr.message);
        }

        // 4. Create Order in Shiprocket
        const srOrder = await createShiprocketOrder(shiprocketPayload);
        
        if (!srOrder.order_id || !srOrder.shipment_id) {
            console.error('[SHIPROCKET_CREATE_FAIL]', srOrder);
            throw new Error(srOrder.message || 'Shiprocket order creation failed. Please check your dashboard address settings.');
        }

        const { order_id: srOrderId, shipment_id: srShipmentId } = srOrder;

        // 5. Update Local Order
        order.status = 'confirmed';
        
        // Add to shipments array
        if (!order.shipments) order.shipments = [];
        order.shipments.push({
            sellerId: req.user.id,
            shiprocketOrderId: srOrderId.toString(),
            shiprocketShipmentId: srShipmentId.toString(),
            status: 'confirmed'
        });

        await order.save();

        return res.json({ 
            message: 'Order confirmed and created in Shiprocket!',
            shiprocketOrderId: srOrderId,
            shipmentId: srShipmentId
        });
    } catch (err: any) {
        const srError = err.response?.data;
        console.error('[SHIPROCKET_CONFIRM_ERROR]', srError || err.message);
        
        let errorMessage = 'Logistics error';
        if (srError) {
            if (srError.message) errorMessage = srError.message;
            if (srError.errors) {
                const firstErrorKey = Object.keys(srError.errors)[0];
                if (firstErrorKey) {
                    errorMessage = `${firstErrorKey}: ${srError.errors[firstErrorKey][0]}`;
                }
            }
        } else {
            errorMessage = err.message;
        }

        return res.status(err.response?.status || 500).json({ 
            message: errorMessage,
            details: srError
        });
    }
});

// ─── POST /api/orders/:id/process-shipment ───────────────────────────────────
// Automates Shiprocket AWB assignment for already confirmed orders
router.post('/:id/process-shipment', protect as any, async (req: any, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found.' });

        if (order.status !== 'confirmed') {
            return res.status(400).json({ message: 'Order must be confirmed first.' });
        }

        // Check if this seller has already processed their portion
        const existingShipment = order.shipments?.find(s => s.sellerId.toString() === req.user.id);
        if (!existingShipment || !existingShipment.shiprocketShipmentId) {
            return res.status(400).json({ message: 'Order not confirmed yet. Please confirm the order first.' });
        }

        if (existingShipment.trackingId) {
            return res.status(400).json({ message: 'AWB already assigned for this shipment.' });
        }

        // 1. Assign AWB (Get Tracking ID)
        const awbRes = await assignAWB(parseInt(existingShipment.shiprocketShipmentId));
        
        if (awbRes.status === 'error' || !awbRes.response?.data?.awb_code) {
             console.error('[SHIPROCKET_AWB_FAIL]', awbRes);
             throw new Error(awbRes.response?.data?.message || awbRes.message || 'Failed to assign AWB. Check Shiprocket wallet balance.');
        }

        const trackingId = awbRes.response.data.awb_code;

        // 2. Update Local Order
        order.status = 'shipped';
        
        existingShipment.courier = awbRes.response?.data?.courier_name || 'Standard';
        existingShipment.trackingId = trackingId;
        existingShipment.shippedAt = new Date();
        existingShipment.status = 'shipped';

        await order.save();

        return res.json({ 
            message: 'AWB assigned successfully!',
            trackingId,
            shipmentId: existingShipment.shiprocketShipmentId
        });
    } catch (err: any) {
        const srError = err.response?.data;
        console.error('[SHIPROCKET_AWB_ERROR]', srError || err.message);
        
        let errorMessage = 'AWB assignment error';
        if (srError) {
            if (srError.message) errorMessage = srError.message;
            if (srError.errors) {
                const firstErrorKey = Object.keys(srError.errors)[0];
                if (firstErrorKey) {
                    errorMessage = `${firstErrorKey}: ${srError.errors[firstErrorKey][0]}`;
                }
            }
        } else {
            errorMessage = err.message;
        }

        return res.status(err.response?.status || 500).json({ 
            message: errorMessage,
            details: srError
        });
    }
});

// ─── GET /api/orders/:id/label ──────────────────────────────────────────────
// Fetches the shipping label URL from Shiprocket for the seller's specific shipment
router.get('/:id/label', protect as any, async (req: any, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found.' });

        const shipment = order.shipments?.find(s => s.sellerId.toString() === req.user.id);
        if (!shipment || !shipment.shiprocketShipmentId) {
            return res.status(404).json({ message: 'Label not available for your portion of this order.' });
        }

        const labelData = await getShippingLabel([parseInt(shipment.shiprocketShipmentId)]);
        return res.json({ 
            label_url: labelData.label_url,
            response: labelData
        });
    } catch (err: any) {
        console.error('[SHIPROCKET_LABEL_ERROR]', err.message);
        return res.status(500).json({ message: 'Failed to fetch shipping label.' });
    }
});

// ─── POST /api/orders/:id/schedule-pickup ───────────────────────────────────
// Schedules a pickup for an already created shipment (specific to seller)
router.post('/:id/schedule-pickup', protect as any, async (req: any, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found.' });

        const shipment = order.shipments?.find(s => s.sellerId.toString() === req.user.id);
        if (!shipment || !shipment.shiprocketShipmentId) {
            return res.status(404).json({ message: 'Shipment not found for your items.' });
        }

        const pickupRes = await schedulePickup(shipment.shiprocketShipmentId);
        
        // Shiprocket might return 200 but with error in message
        if (pickupRes.status === 'error' || pickupRes.pickup_status === 'error') {
            throw new Error(pickupRes.message || 'Failed to schedule pickup. Ensure wallet balance is sufficient.');
        }

        shipment.status = 'pickup_scheduled';
        
        // Update overall order status to pickup_scheduled
        order.status = 'pickup_scheduled';
        
        await order.save();

        return res.json({ 
            message: 'Pickup scheduled successfully!', 
            response: pickupRes 
        });
    } catch (err: any) {
        console.error('[SHIPROCKET_PICKUP_ERROR]', err.response?.data || err.message);
        return res.status(500).json({ message: err.response?.data?.message || err.message });
    }
});

// ─── POST /api/orders/:id/manifest ──────────────────────────────────────────
// Generates and returns the manifest for a seller's shipment (Handover)
router.post('/:id/manifest', protect as any, async (req: any, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found.' });

        const shipment = order.shipments?.find(s => s.sellerId.toString() === req.user.id);
        if (!shipment || !shipment.shiprocketShipmentId) {
            return res.status(404).json({ message: 'Shipment not found for manifest generation.' });
        }

        const sid = parseInt(shipment.shiprocketShipmentId);
        await generateManifest([sid]);
        const printRes = await printManifest([sid]);

        return res.json({
            message: 'Manifest generated successfully!',
            manifest_url: printRes.manifest_url
        });
    } catch (err: any) {
        console.error('[SHIPROCKET_MANIFEST_ERROR]', err.response?.data || err.message);
        return res.status(500).json({ message: 'Failed to generate manifest. Ensure shipment has an AWB assigned.' });
    }
});

// ─── GET /api/orders/:id/tracking ───────────────────────────────────────────
// Fetches detailed tracking info for a seller's shipment
router.get('/:id/tracking', protect as any, async (req: any, res: Response) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found.' });

        const shipment = order.shipments?.find(s => s.sellerId.toString() === req.user.id);
        if (!shipment || !shipment.shiprocketShipmentId) {
            return res.status(404).json({ message: 'No active shipment found for your items.' });
        }

        const trackingData = await getShipmentTracking(shipment.shiprocketShipmentId);
        return res.json(trackingData);
    } catch (err: any) {
        console.error('[SHIPROCKET_TRACKING_ERROR]', err.response?.data || err.message);
        return res.status(500).json({ message: 'Failed to fetch tracking details.' });
    }
});

export default router;
