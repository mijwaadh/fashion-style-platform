import mongoose, { Document, Schema } from 'mongoose';

export interface ICollection extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    isPrivate: boolean;
    looks: mongoose.Types.ObjectId[];
}

const collectionSchema = new Schema<ICollection>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        description: { type: String },
        isPrivate: { type: Boolean, default: false },
        looks: [{ type: Schema.Types.ObjectId, ref: 'Look' }],
    },
    { timestamps: true }
);

export default mongoose.model<ICollection>('Collection', collectionSchema);
