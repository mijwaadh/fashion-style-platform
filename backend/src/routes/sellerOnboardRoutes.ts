import express from 'express';
import { verifyTaxDetails, completeOnboarding, updateSellerProfile } from '../controllers/sellerOnboardController';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.post('/verify-tax', protect, verifyTaxDetails);
router.post('/complete', protect, completeOnboarding);
router.put('/profile', protect, updateSellerProfile);

export default router;
