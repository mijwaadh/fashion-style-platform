import { Router } from 'express';
import { register, login, getMe, verifyOtp, resendOtp } from '../controllers/authController';
import { protect } from '../middlewares/auth';

const router = Router();
console.log("authRoutes");
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.get('/me', protect, getMe);

export default router;
