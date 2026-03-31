import mongoose, { Document, Schema } from 'mongoose';

export interface ILook extends Document {
    creatorId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    imageUrl: string;
    images?: string[];
    videoUrl?: string;
    occasion: string[]; // e.g., wedding, college, office, festival
    budgetRange: 'budget' | 'mid-range' | 'luxury';
    totalEstimatedBudget: number;
    bodyType?: string[];
    gender: 'men' | 'women' | 'unisex';
    trendingScore: number;
    productsIncluded: {
        product: mongoose.Schema.Types.ObjectId;
        matchType: 'exact' | 'similar';
    }[]; // refs to Products with match metadata
    likes: mongoose.Types.ObjectId[];
    likesCount: number;
    savesCount: number;
    viewsCount: number;
    isUserCreated?: boolean;
    isAiGenerated?: boolean;
    status: 'draft' | 'published';
    isInternal: boolean;
    layoutMetadata?: Record<string, { x: number, y: number, scale: number, zIndex: number }>;
    isFeatured: boolean;
}

const lookSchema = new Schema<ILook>(
    {
        creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        description: { type: String, required: true, maxlength: 500 },
        imageUrl: { type: String, required: true },
        images: [{ type: String }],
        videoUrl: { type: String },
        occasion: [{ type: String }],
        budgetRange: { type: String, enum: ['budget', 'mid-range', 'luxury'], required: true },
        totalEstimatedBudget: { type: Number, required: true },
        bodyType: [{ type: String }],
        gender: { type: String, enum: ['men', 'women', 'unisex'], required: true },
        trendingScore: { type: Number, default: 0 },
        productsIncluded: [{
            product: { type: Schema.Types.ObjectId, ref: 'Product' },
            matchType: { type: String, enum: ['exact', 'similar'], default: 'exact' }
        }],
        likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        likesCount: { type: Number, default: 0 },
        savesCount: { type: Number, default: 0 },
        viewsCount: { type: Number, default: 0 },
        isUserCreated: { type: Boolean, default: false },
        isAiGenerated: { type: Boolean, default: false },
        status: { type: String, enum: ['draft', 'published'], default: 'draft' },
        isInternal: { type: Boolean, default: false },
        layoutMetadata: { type: Schema.Types.Mixed, default: {} },
        isFeatured: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model<ILook>('Look', lookSchema);
