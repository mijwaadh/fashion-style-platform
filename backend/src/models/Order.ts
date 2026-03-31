import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    ownerId:  mongoose.Types.ObjectId;
    name:      string;
    imageUrl:  string;
    price:     number;
    quantity:  number;
    size?:     string;
    color?:    string;
    commissionRate: number; // Percentage at time of order
    sellerShare: number;    // Absolute amount for seller in INR
    deliveredAt?: Date;     // When was this item delivered?
    isSettled?: boolean;    // Has money moved to available balance?
}

export interface IOrder extends Document {
    buyerId: mongoose.Types.ObjectId;
    items: IOrderItem[];
    shippingAddress: {
        fullName: string;
        phone: string;
        line1: string;
        line2?: string;
        pincode: string;
        city: string;
        state: string;
    };
    pricing: {
        subtotal: number;
        platformFee: number;
        gst: number;
        total: number;
    };
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'pickup_scheduled' | 'delivered' | 'cancelled';
    payment: {
        razorpayOrderId?: string;
        razorpayPaymentId?: string;
        razorpaySignature?: string;
        status: 'pending' | 'paid' | 'failed' | 'refunded';
    };
    shipments: {
        ownerId: mongoose.Types.ObjectId;
        courier?: string;
        trackingId?: string;
        shippedAt?: Date;
        status: 'confirmed' | 'shipped' | 'pickup_scheduled' | 'delivered';
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    ownerId:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name:      { type: String, required: true },
    imageUrl:  { type: String, required: true },
    price:     { type: Number, required: true },
    quantity:  { type: Number, required: true, min: 1 },
    size:      { type: String },
    color:     { type: String },
    commissionRate: { type: Number, required: true },
    sellerShare: { type: Number, required: true },
    deliveredAt: { type: Date },
    isSettled: { type: Boolean, default: false },
}, { _id: false });

const orderSchema = new Schema<IOrder>(
    {
        buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        items:   [orderItemSchema],
        shippingAddress: {
            fullName: { type: String, required: true },
            phone:    { type: String, required: true },
            line1:    { type: String, required: true },
            line2:    { type: String },
            pincode:  { type: String, required: true },
            city:     { type: String, required: true },
            state:    { type: String, required: true },
        },
        pricing: {
            subtotal:    { type: Number, required: true },
            platformFee: { type: Number, default: 0 },
            gst:         { type: Number, default: 0 },
            total:       { type: Number, required: true },
        },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'processing', 'shipped', 'pickup_scheduled', 'delivered', 'cancelled'],
            default: 'pending',
        },
        payment: {
            razorpayOrderId:   { type: String },
            razorpayPaymentId: { type: String },
            razorpaySignature: { type: String },
            status:            { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
        },
        shipments: [
            {
                ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
                courier: { type: String },
                trackingId: { type: String },
                shippedAt: { type: Date },
                status: { type: String, enum: ['confirmed', 'shipped', 'pickup_scheduled', 'delivered'] },
            }
        ],
    },
    { timestamps: true }
);

export default mongoose.model<IOrder>('Order', orderSchema);
