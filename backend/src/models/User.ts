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
        savedLooks: [{ type: Schema.Types.ObjectId, ref: 'Look' }],
        likedLooks: [{ type: Schema.Types.ObjectId, ref: 'Look' }],
        likedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
        savedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
        followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        following: [{ type: Schema.Types.ObjectId, ref: 'User' }],

        isVerified: { type: Boolean, default: false },
        otp: { type: String },
        otpExpires: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
