import Notification from '../models/Notification';
import mongoose from 'mongoose';

export const createNotification = async (
    recipientId: string | mongoose.Types.ObjectId,
    senderId: string | mongoose.Types.ObjectId,
    type: 'follow' | 'comment' | 'save' | 'system' | 'broadcast' | 'like',
    relatedLookId?: string | mongoose.Types.ObjectId,
    message?: string
) => {
    try {
        // Don't notify yourself
        if (recipientId.toString() === senderId.toString()) return null;

        const notification = await Notification.create({
            recipientId,
            senderId,
            type,
            relatedLookId,
            message,
            isRead: false
        });
        return notification;
    } catch (error) {
        console.error('FAILED_TO_CREATE_NOTIFICATION:', error);
        return null;
    }
};
