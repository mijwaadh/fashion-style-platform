import { Router, Request, Response } from 'express';
import Order from '../models/Order';
import User from '../models/User';

const router = Router();

/**
 * @POST /api/webhooks/shiprocket
 * Listener for Shiprocket status updates (Delivered, Shipped, etc.)
 */
router.post('/shiprocket', async (req: Request, res: Response) => {
    try {
        const { current_status, awb, order_id } = req.body;
        console.log(`[SHIPROCKET_WEBHOOK] Received status "${current_status}" for AWB ${awb} / Order ${order_id}`);

        if (current_status === 'DELIVERED') {
            const order = await Order.findById(order_id);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            if (order.status !== 'delivered') {
                const now = new Date();
                
                // 1. Update status to delivered
                order.status = 'delivered';
                
                // 2. Add funds to pending balance for all sellers in the order
                for (const item of order.items) {
                    if (item.sellerId && item.sellerShare && !item.deliveredAt) {
                        console.log(`[SETTLEMENT_TRIGGER] Adding ₹${item.sellerShare} to pending for seller ${item.sellerId}`);
                        
                        await User.updateOne(
                            { _id: item.sellerId },
                            { 
                                $inc: { 
                                    pendingBalance: item.sellerShare,
                                    lifetimeEarnings: item.sellerShare 
                                }
                            }
                        );
                        
                        item.deliveredAt = now;
                        item.isSettled = false;
                    }
                }

                await order.save();
                console.log(`[SHIPROCKET_WEBHOOK] Order ${order_id} successfully marked as DELIVERED.`);
            }
        }

        // Always return 200 to Shiprocket
        return res.sendStatus(200);
    } catch (err: any) {
        console.error('[SHIPROCKET_WEBHOOK_ERROR]', err.message);
        return res.status(500).json({ message: err.message });
    }
});

export default router;
