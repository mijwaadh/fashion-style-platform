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

        const user = await User.create({
            name, email, passwordHash, role: role || 'user', storeName,
            otp, otpExpires, isVerified: false
        });

        // Send Email
        await sendOTP(email, otp);

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
            _id: user._id, name: user.name, email: user.email, role: user.role,
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

        if (!user.otp || user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid verification code.' });
        }

        if (user.otpExpires && user.otpExpires < new Date()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }

        // Success - Verify user
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        return res.json({
            message: 'Email verified successfully!',
            _id: user._id, name: user.name, email: user.email, role: user.role,
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
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendOTP(email, otp);

        return res.json({ message: 'A new verification code has been sent to your email.' });
    } catch (err: any) {
        return res.status(500).json({ message: err.message });
    }
};
