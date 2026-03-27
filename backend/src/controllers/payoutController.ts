import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import User from '../models/User';
import Order from '../models/Order';
import Payout from '../models/Payout';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not defined in the environment.");
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

// @POST /api/payouts/setup-account
// Seller enters bank details to create a Razorpay Contact and Fund Account
export const setupAccount = async (req: any, res: Response) => {
    try {
        const { accountNumber, ifsc, beneficiaryName } = req.body;
        const userId = req.user.id;

        if (!accountNumber || !ifsc || !beneficiaryName) {
            return res.status(400).json({ message: 'All bank details are required.' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        let fundAccountId = `mock_fund_${Date.now()}`;

        if (process.env.LIVE_PAYOUTS === 'true') {
            // 1. Create Contact in Razorpay
            let contactId = user.razorpayContactId;
            if (!contactId) {
                const contactParams = {
                    name: user.name,
                    email: user.email,
                    type: 'vendor',
                    reference_id: user._id.toString(),
                };
                const contactInfo: any = await (razorpay as any).contacts.create(contactParams);
                contactId = contactInfo.id;
                user.razorpayContactId = contactId;
                await user.save();
            }

            // 2. Create Fund Account
            const fundAccountParams = {
                contact_id: contactId as string,
                account_type: 'bank_account',
                bank_account: {
                    name: beneficiaryName,
                    ifsc: ifsc,
                    account_number: accountNumber,
                },
            };
            const fundAccountInfo: any = await (razorpay as any).fundAccount.create(fundAccountParams);
            fundAccountId = fundAccountInfo.id;
        }

        // 3. Save to User
        user.razorpayFundAccountId = fundAccountId;
        user.bankDetails = {
            accountNumber,
            ifsc,
            beneficiaryName,
        };
        await user.save();

        return res.json({ message: 'Bank account linked successfully.', fundAccountId: fundAccountId });
    } catch (err: any) {
        console.error('[RAZORPAY_SETUP_ERROR]', err);
        return res.status(500).json({ message: err.error?.description || err.message || 'Failed to link account' });
    }
};

// @POST /api/payouts/request
// Seller requests a payout (creates pending Payout record)
export const requestPayout = async (req: any, res: Response) => {
    try {
        const { amount } = req.body;
        const userId = req.user.id;

        if (!amount || amount < 100) {
            return res.status(400).json({ message: 'Minimum payout amount is ₹100.' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (!user.razorpayFundAccountId) {
            return res.status(400).json({ message: 'Please link a bank account before requesting a payout.' });
        }

        if (amount > (user.sellerBalance || 0)) {
            return res.status(400).json({ message: `Insufficient funds. Your available balance is ₹${(user.sellerBalance || 0).toLocaleString()}.` });
        }

        // 1. Deduct from seller balance immediately (Move to Payout)
        await User.findByIdAndUpdate(userId, {
            $inc: { sellerBalance: -amount }
        });

        const payout = await Payout.create({
            sellerId: userId,
            amount,
            status: 'pending',
            currency: 'INR',
        });

        return res.status(201).json({ message: 'Payout requested successfully.', payout });
    } catch (err: any) {
        console.error('[PAYOUT_REQUEST_ERROR]', err);
        return res.status(500).json({ message: err.message });
    }
};

// @POST /api/payouts/process/:id
// Admin approves and processes the payout via Razorpay
export const processPayout = async (req: any, res: Response) => {
    try {
        const payoutId = req.params.id;
        
        // This should be an admin-only route
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized.' });
        }

        const payout = await Payout.findById(payoutId).populate('sellerId');
        if (!payout) return res.status(404).json({ message: 'Payout not found.' });

        if (payout.status !== 'pending') {
            return res.status(400).json({ message: `Payout is already ${payout.status}.` });
        }

        const seller: any = payout.sellerId;
        if (!seller.razorpayFundAccountId) {
            return res.status(400).json({ message: 'Seller does not have a linked bank account.' });
        }

        payout.status = 'processing';
        await payout.save();

        let rpResponseId = `mock_payout_${Date.now()}`;

        // If LIVE mode is strictly on, call the actual Razorpay API
        if (process.env.LIVE_PAYOUTS === 'true') {
            const rpPayoutParams = {
                account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER || '2323230058202538', // The merchant's RazorpayX active account
                fund_account_id: seller.razorpayFundAccountId,
                amount: payout.amount * 100, // in paise
                currency: 'INR',
                mode: 'IMPS',
                purpose: 'payout',
                queue_if_low_balance: true,
                reference_id: payout._id.toString(),
                narration: 'Aura Marketplace Payout',
            };

            const rpResponse: any = await (razorpay as any).payouts.create(rpPayoutParams);
            rpResponseId = rpResponse.id;
        }

        payout.razorpayPayoutId = rpResponseId;
        payout.status = 'completed'; // For brevity, assuming instant success. Real setup requires webhooks.
        payout.processedAt = new Date();
        await payout.save();

        return res.json({ message: 'Payout processed successfully.', payout });
    } catch (err: any) {
        console.error('[RAZORPAY_PROCESS_ERROR]', err);
        
        // Mark as failed
        const payout = await Payout.findById(req.params.id);
        if (payout) {
            payout.status = 'failed';
            payout.failureReason = err.error?.description || err.message;
            await payout.save();

            // Refund the seller's balance on failure
            await User.findByIdAndUpdate(payout.sellerId, {
                $inc: { sellerBalance: payout.amount }
            });
        }

        return res.status(500).json({ message: err.error?.description || err.message || 'Failed to process payout.' });
    }
};

// @GET /api/payouts
// Get seller's payout history
export const getMyPayouts = async (req: any, res: Response) => {
    try {
        const payouts = await Payout.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
        return res.json(payouts);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @GET /api/payouts/all
// Admin gets all payouts
export const getAllPayouts = async (req: any, res: Response) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized.' });
        }
        const payouts = await Payout.find().populate('sellerId', 'name storeName email').sort({ createdAt: -1 });
        return res.json(payouts);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @POST /api/payouts/settle-orders
// Admin or System trigger to move pending balances to available after 7 days
export const settlePendingBalances = async (req: any, res: Response) => {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Find all orders that contain delivered items that are not yet settled
        const ordersArr = await Order.find({
            'items.isSettled': false,
            'status': 'delivered' 
        });

        let settledCount = 0;
        let totalAmountSettled = 0;

        for (const order of ordersArr) {
            let orderChanged = false;
            for (const item of order.items) {
                // Check if delivered, not settled, and was delivered > 7 days ago
                if (
                    item.deliveredAt && 
                    item.deliveredAt < sevenDaysAgo && 
                    !item.isSettled
                ) {
                    // 1. Transfer from pending to available
                    await User.updateOne(
                        { _id: item.sellerId },
                        { 
                            $inc: { 
                                pendingBalance: -item.sellerShare,
                                sellerBalance: item.sellerShare 
                            }
                        }
                    );

                    // 2. Mark as settled
                    item.isSettled = true;
                    orderChanged = true;
                    settledCount++;
                    totalAmountSettled += item.sellerShare;
                }
            }
            if (orderChanged) {
                await order.save();
            }
        }

        return res.json({ 
            message: `Settlement complete.`, 
            itemsSettled: settledCount,
            amountSettled: totalAmountSettled
        });
    } catch (err: any) {
        console.error('[SETTLEMENT_ERROR]', err);
        return res.status(500).json({ message: err.message });
    }
};
