import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
    content: string;
    user: mongoose.Types.ObjectId;
    look: mongoose.Types.ObjectId;
    parentComment?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema(
    {
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: [1000, 'Comment cannot exceed 1000 characters'],
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        look: {
            type: Schema.Types.ObjectId,
            ref: 'Look',
            required: true,
        },
        parentComment: {
            type: Schema.Types.ObjectId,
            ref: 'Comment',
            default: null, // If null, it's a top-level comment. If not, it's a reply.
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IComment>('Comment', commentSchema);
