import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { sendOTP } from '../utils/emailService';

const generateToken = (id: string, role: string) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '30d' });
};

// @POST /api/auth/register
export const register = async (req: Request, res: Response) => {
    const { name, email, password, role, storeName } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ message: 'An account with this email already exists.' });

        const passwordHash = await bcrypt.hash(password, 12);

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Generate a verification token for Magic Link
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours for the link

        const user = await User.create({
            name, email, passwordHash, role: role || 'user',
            otp, otpExpires, 
            verificationToken, verificationTokenExpires,
            isVerified: false
        });

        // Send Email asynchronously so we don't block the UI thread waiting for SMTP
        sendOTP(email, otp, verificationToken).catch(console.error);

        return res.status(201).json({
            message: 'Registration successful. Please verify your email.',
            requiresVerification: true,
            email: user.email
        });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @POST /api/auth/login
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log('LOGIN_REQUEST_RECEIVED:', email);
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    try {
        const user = await User.findOne({ email });
        console.log('USER_FOUND:', user ? 'Yes' : 'No');
        if (!user) return res.status(401).json({ message: 'Invalid email or password.' });

        const match = await bcrypt.compare(password, user.passwordHash);
        console.log('PASSWORD_MATCH:', match);
        if (!match) return res.status(401).json({ message: 'Invalid email or password.' });

        if (!user.isVerified) {
            return res.status(403).json({
                message: 'Please verify your email before logging in.',
                requiresVerification: true,
                email: user.email
            });
        }

        return res.json({
            _id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            likedProducts: user.likedProducts || [],
            likedLooks: user.likedLooks || [],
            savedLooks: user.savedLooks || [],
            token: generateToken(user._id.toString(), user.role),
        });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @GET /api/auth/me
export const getMe = async (req: Request, res: Response) => {
    try {
        const user = await User.findById((req as any).user.id).select('-passwordHash');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        return res.json(user);
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @POST /api/auth/verify-otp
export const verifyOtp = async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found.' });

        if (user.isVerified) return res.status(400).json({ message: 'Email is already verified.' });

        // Developer Fallback: In non-production, 123456 always works
        const isDevFallback = process.env.NODE_ENV !== 'production' && otp === '123456';

        if (!isDevFallback) {
            if (!user.otp || user.otp !== otp) {
                return res.status(400).json({ message: 'Invalid verification code.' });
            }

            if (user.otpExpires && user.otpExpires < new Date()) {
                return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
            }
        }

        // Success - Verify user
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        return res.json({
            message: 'Email verified successfully!',
            _id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            likedProducts: user.likedProducts || [],
            likedLooks: user.likedLooks || [],
            savedLooks: user.savedLooks || [],
            token: generateToken(user._id.toString(), user.role),
        });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @POST /api/auth/resend-otp
export const resendOtp = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found.' });
        if (user.isVerified) return res.status(400).json({ message: 'Email is already verified.' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        
        await user.save();

        sendOTP(email, otp, verificationToken).catch(console.error);

        return res.json({ message: 'A new verification code and link have been sent to your email.' });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required.' });

    try {
        const user = await User.findOne({ email });
        if (!user) {
            // We return 200 even if user not found to prevent email enumeration
            return res.status(200).json({ message: 'If an account exists with this email, a reset link has been sent.' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Hash and save it
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await user.save();

        // Send email (async)
        const { sendPasswordResetEmail } = require('../utils/emailService');
        sendPasswordResetEmail(email, resetToken).catch(console.error);

        return res.status(200).json({ message: 'If an account exists with this email, a reset link has been sent.' });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @POST /api/auth/reset-password/:token
export const resetPassword = async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ message: 'Password is required.' });

    try {
        // Hash the incoming token to compare with DB
        const hashedToken = crypto
            .createHash('sha256')
            .update(token as string)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        // Update password
        user.passwordHash = await bcrypt.hash(password, 12);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({ message: 'Password reset successful. You can now log in.' });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};

// @GET /api/auth/verify-link/:token
export const verifyLink = async (req: Request, res: Response) => {
    const { token } = req.params;

    try {
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification link.' });
        }

        if (user.isVerified) {
            return res.status(200).json({ 
                message: 'Account is already verified. Redirecting to login...',
                isAlreadyVerified: true
            });
        }

        // Success - Verify user
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        return res.json({
            message: 'Email verified successfully!',
            _id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            likedProducts: user.likedProducts || [],
            likedLooks: user.likedLooks || [],
            savedLooks: user.savedLooks || [],
            token: generateToken(user._id.toString(), user.role),
        });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};
