import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: 'user' | 'seller' | 'admin';
    profileImage?: string;
    bio?: string;
    // Seller specific
    storeName?: string;
    storeDescription?: string;
    isVerifiedSeller?: boolean;
    onboardingCompleted?: boolean;
    
    // Tax & Onboarding Details
    gstin?: string;
    enrollmentId?: string;
    pickupAddress?: {
        room: string;
        street: string;
        landmark?: string;
        pincode: string;
        city: string;
        state: string;
    };
    businessType?: string;
    agreedToSupplierTerms?: boolean;

    savedLooks: mongoose.Types.ObjectId[];
    likedLooks: mongoose.Types.ObjectId[];
    likedProducts: mongoose.Types.ObjectId[];
    savedProducts: mongoose.Types.ObjectId[];
    followers: mongoose.Types.ObjectId[];
    following: mongoose.Types.ObjectId[];

    // OTP Verification
    isVerified: boolean;
    otp?: string;
    otpExpires?: Date;
    // Payout details
    razorpayContactId?: string;
    razorpayFundAccountId?: string;
    bankDetails?: {
        accountNumber: string;
        ifsc: string;
        beneficiaryName: string;
    };
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true },
        role: { type: String, enum: ['user', 'seller', 'admin'], default: 'user' },
        profileImage: { type: String },
        bio: { type: String },
        storeName: { type: String },
        storeDescription: { type: String },
        isVerifiedSeller: { type: Boolean, default: false },
        onboardingCompleted: { type: Boolean, default: false },

        gstin: { type: String },
        enrollmentId: { type: String },
        pickupAddress: {
            room: { type: String },
            street: { type: String },
            landmark: { type: String },
            pincode: { type: String },
            city: { type: String },
            state: { type: String },
        },
        businessType: { type: String },
        agreedToSupplierTerms: { type: Boolean, default: false },

        savedLooks: [{ type: Schema.Types.ObjectId, ref: 'Look' }],
        likedLooks: [{ type: Schema.Types.ObjectId, ref: 'Look' }],
        likedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
        savedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
        followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        following: [{ type: Schema.Types.ObjectId, ref: 'User' }],

        isVerified: { type: Boolean, default: false },
        otp: { type: String },
        otpExpires: { type: Date },

        razorpayContactId: { type: String },
        razorpayFundAccountId: { type: String },
        bankDetails: {
            accountNumber: { type: String },
            ifsc: { type: String },
            beneficiaryName: { type: String },
        },
    },
    { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
