import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: 'user' | 'admin';
    profileImage?: string;
    bio?: string;

    savedLooks: mongoose.Types.ObjectId[];
    likedLooks: mongoose.Types.ObjectId[];
    likedProducts: mongoose.Types.ObjectId[];
    savedProducts: mongoose.Types.ObjectId[];
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];

    // Wallet (T+7 System)
    pendingBalance: number;
    sellerBalance: number;
    lifetimeEarnings: number;


    // OTP Verification
    isVerified: boolean;
    otp?: string;
    otpExpires?: Date;
    verificationToken?: string;
    verificationTokenExpires?: Date;
    // Payout details
    razorpayContactId?: string;
    razorpayFundAccountId?: string;
    bankDetails?: {
        accountNumber: string;
        ifsc: string;
        beneficiaryName: string;
    };
    // Buyer address book
    addresses?: {
        _id?: mongoose.Types.ObjectId;
        label: string; // e.g. "Home", "Office"
        fullName: string;
        phone: string;
        line1: string;
        line2?: string;
        pincode: string;
        city: string;
        state: string;
        isDefault?: boolean;
    }[];

    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        profileImage: { type: String },
        bio: { type: String },

        savedLooks: [{ type: Schema.Types.ObjectId, ref: 'Look' }],
        likedLooks: [{ type: Schema.Types.ObjectId, ref: 'Look' }],
        likedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
        savedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
        followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        following: [{ type: Schema.Types.ObjectId, ref: 'User' }],

        // Financials (T+7 System)
        pendingBalance: { type: Number, default: 0 },
        sellerBalance: { type: Number, default: 0 },
        lifetimeEarnings: { type: Number, default: 0 },

        isVerified: { type: Boolean, default: false },
        otp: { type: String },
        otpExpires: { type: Date },
        verificationToken: { type: String },
        verificationTokenExpires: { type: Date },

        // Password Reset
        resetPasswordToken: { type: String },
        resetPasswordExpires: { type: Date },

        razorpayContactId: { type: String },
        razorpayFundAccountId: { type: String },
        bankDetails: {
            accountNumber: { type: String },
            ifsc: { type: String },
            beneficiaryName: { type: String },
        },
        addresses: [{
            label:     { type: String, default: 'Home' },
            fullName:  { type: String, required: true },
            phone:     { type: String, required: true },
            line1:     { type: String, required: true },
            line2:     { type: String },
            pincode:   { type: String, required: true },
            city:      { type: String, required: true },
            state:     { type: String, required: true },
            isDefault: { type: Boolean, default: false },
        }],
    },

    { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
