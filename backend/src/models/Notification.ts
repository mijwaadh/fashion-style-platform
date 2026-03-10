import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    recipientId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    type: 'follow' | 'comment' | 'save' | 'system' | 'broadcast';
    relatedLookId?: mongoose.Types.ObjectId;
    isRead: boolean;
    message?: string; // Optional custom message for system/broadcast notifications
    targetRole?: 'all' | 'user' | 'seller'; // For broadcast targeting
}

const notificationSchema = new Schema<INotification>(
    {
        recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: {
            type: String,
            enum: ['follow', 'comment', 'save', 'system', 'broadcast', 'like'],
            required: true,
        },
        relatedLookId: { type: Schema.Types.ObjectId, ref: 'Look' },
        isRead: { type: Boolean, default: false },
        message: { type: String },
        targetRole: { type: String, enum: ['all', 'user', 'seller'] },
    },
    { timestamps: true }
);

export default mongoose.model<INotification>('Notification', notificationSchema);
