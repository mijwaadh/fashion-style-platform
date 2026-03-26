import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    sellerId:  mongoose.Types.ObjectId;
    name:      string;
    imageUrl:  string;
    price:     number;
    quantity:  number;
    size?:     string;
    color?:    string;
}

export interface IShippingAddress {
    fullName: string;
    phone:    string;
    line1:    string;
    line2?:   string;
    pincode:  string;
    city:     string;
    state:    string;
}

export interface IOrder extends Document {
    buyerId:         mongoose.Types.ObjectId;
    items:           IOrderItem[];
    shippingAddress: IShippingAddress;
    pricing: {
        subtotal:    number;
        platformFee: number;
        gst:         number;
        total:       number;
    };
    status: 'pending_payment' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    payment: {
        razorpayOrderId:   string;
        razorpayPaymentId?: string;
        razorpaySignature?: string;
        status: 'pending' | 'paid' | 'failed';
    };
}

const orderItemSchema = new Schema<IOrderItem>({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sellerId:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name:      { type: String, required: true },
    imageUrl:  { type: String, required: true },
    price:     { type: Number, required: true },
    quantity:  { type: Number, required: true, min: 1 },
    size:      { type: String },
    color:     { type: String },
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
            enum: ['pending_payment', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
            default: 'pending_payment',
        },
        payment: {
            razorpayOrderId:   { type: String, required: true },
            razorpayPaymentId: { type: String },
            razorpaySignature: { type: String },
            status:            { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
        },
    },
    { timestamps: true }
);

export default mongoose.model<IOrder>('Order', orderSchema);
