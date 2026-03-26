import express from 'express';
import { verifyTaxDetails, completeOnboarding } from '../controllers/sellerOnboardController';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.post('/verify-tax', protect, verifyTaxDetails);
router.post('/complete', protect, completeOnboarding);

export default router;
