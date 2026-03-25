import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth';
import { setupAccount, requestPayout, processPayout, getMyPayouts, getAllPayouts } from '../controllers/payoutController';

const router = Router();

// Seller Routes
router.post('/setup-account', protect as any, authorize('seller', 'admin') as any, setupAccount as any);
router.post('/request', protect as any, authorize('seller', 'admin') as any, requestPayout as any);
router.get('/', protect as any, authorize('seller', 'admin') as any, getMyPayouts as any);

// Admin Routes
router.post('/process/:id', protect as any, authorize('admin') as any, processPayout as any);
router.get('/all', protect as any, authorize('admin') as any, getAllPayouts as any);

export default router;
