import mongoose, { Document, Schema } from 'mongoose';

export interface IPayout extends Document {
    ownerId: mongoose.Types.ObjectId;
    amount: number;
    currency: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected';
    razorpayPayoutId?: string;
    failureReason?: string;
    requestedAt: Date;
    processedAt?: Date;
}

const payoutSchema = new Schema<IPayout>(
    {
        ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'INR' },
        status: { 
            type: String, 
            enum: ['pending', 'processing', 'completed', 'failed', 'rejected'], 
            default: 'pending' 
        },
        razorpayPayoutId: { type: String },
        failureReason: { type: String },
        requestedAt: { type: Date, default: Date.now },
        processedAt: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model<IPayout>('Payout', payoutSchema);
