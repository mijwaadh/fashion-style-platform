import { Router } from 'express';
import { protect, authorize } from '../middlewares/auth';
import { getAnalyticsOverview } from '../controllers/analyticsController';

const router = Router();

// @GET /api/analytics/overview
router.get('/overview', protect, authorize('seller', 'admin'), getAnalyticsOverview);

export default router;
