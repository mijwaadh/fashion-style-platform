'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
    ArrowLeft, 
    Package, 
    Truck, 
    CheckCircle, 
    Clock, 
    MapPin, 
    CreditCard, 
    ExternalLink, 
    ChevronRight,
    Loader2,
    AlertCircle,
    Info
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface OrderItem {
    productId: string;
    ownerId: string;
    name: string;
    imageUrl: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
}

interface Shipment {
    ownerId: string;
    courier?: string;
    trackingId?: string;
    shippedAt?: string;
    status: 'confirmed' | 'shipped' | 'pickup_scheduled' | 'delivered';
}

interface Order {
    _id: string;
    items: OrderItem[];
    shippingAddress: {
        fullName: string;
        phone: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        pincode: string;
    };
    pricing: {
        subtotal: number;
        deliveryCharge: number;
        total: number;
    };
    status: string;
    payment: {
        status: string;
        razorpayOrderId?: string;
    };
    shipments: Shipment[];
    createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
    processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Package },
    shipped: { label: 'Shipped', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Truck },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
};

export default function OrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        api.get<Order>(`/api/orders/${id}`)
            .then(setOrder)
            .catch(err => {
                console.error(err);
                toast.error("Failed to load order details");
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium animate-pulse text-sm uppercase tracking-widest">Loading order details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-16 h-16 text-muted-foreground/20 mb-4" />
                <h1 className="text-2xl font-serif font-bold mb-2">Order Not Found</h1>
                <p className="text-muted-foreground mb-6">The order you're looking for doesn't exist or you don't have access.</p>
                <Button onClick={() => router.push('/account/orders')} className="rounded-full px-8">Back to My Orders</Button>
            </div>
        );
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const overallStatus = STATUS_MAP[order.status] || STATUS_MAP.pending;
    const StatusIcon = overallStatus.icon;

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            {/* Header */}
            <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-10 transition-all">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/account/orders" className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <h1 className="font-serif text-lg font-bold">Order Details</h1>
                    </div>
                    <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${overallStatus.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {overallStatus.label}
                    </Badge>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                {/* Top Summary Card */}
                <div className="bg-background rounded-3xl border border-border shadow-sm p-6 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                        <Package className="w-32 h-32" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-1">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Order #</p>
                            <h2 className="text-lg font-mono font-bold text-foreground overflow-hidden text-ellipsis">{order._id}</h2>
                            <p className="text-xs text-muted-foreground mt-1">Placed on {formatDate(order.createdAt)}</p>
                        </div>
                        <div className="md:text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Payment Status</p>
                            <p className="text-sm font-bold capitalize text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full inline-block border border-emerald-100">
                                {order.payment.status === 'paid' ? 'Successful Payment' : order.payment.status}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Items & Shipping (LHS) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="bg-background rounded-3xl border border-border shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                                <h3 className="font-serif font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                                    <Package className="w-4 h-4 text-primary" /> Items in Order
                                </h3>
                                <span className="text-xs font-bold text-muted-foreground">{order.items.length} Product(s)</span>
                            </div>
                            <div className="divide-y divide-border">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="p-6 flex gap-4 group hover:bg-muted/10 transition-colors">
                                        <div className="relative w-20 h-24 rounded-2xl overflow-hidden bg-muted flex-shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h4 className="font-bold text-sm leading-tight text-foreground line-clamp-2">{item.name}</h4>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {item.size && <Badge variant="secondary" className="text-[9px] px-2 py-0 font-bold uppercase tracking-widest">S: {item.size}</Badge>}
                                                {item.color && <Badge variant="secondary" className="text-[9px] px-2 py-0 font-bold uppercase tracking-widest">C: {item.color}</Badge>}
                                            </div>
                                            <div className="flex items-center justify-between mt-3">
                                                <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                                                <p className="font-black text-sm text-emerald-600">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-background rounded-3xl border border-border shadow-sm p-6 space-y-4">
                            <h3 className="font-serif font-bold flex items-center gap-2 border-b border-border pb-3 mb-2 text-sm uppercase tracking-wider">
                                <MapPin className="w-4 h-4 text-rose-500" /> Delivery Address
                            </h3>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-rose-500" />
                                </div>
                                <div>
                                    <p className="font-black text-base text-foreground mb-1">{order.shippingAddress.fullName}</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {order.shippingAddress.line1}
                                        {order.shippingAddress.line2 && <>, {order.shippingAddress.line2}</>}
                                        <br />
                                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                    </p>
                                    <p className="text-sm font-bold text-foreground mt-3 flex items-center gap-2">
                                        <Truck className="w-3.5 h-3.5 text-muted-foreground" /> 
                                        {order.shippingAddress.phone}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tracking & Pricing (RHS) */}
                    <div className="space-y-6">
                        {/* Shipment Tracking Timeline */}
                        <div className="bg-background rounded-3xl border border-border shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-border bg-zinc-900 text-white">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-primary" /> Track Shipments
                                </h3>
                            </div>
                            <div className="p-6">
                                {order.shipments && order.shipments.length > 0 ? (
                                    <div className="space-y-10">
                                        {order.shipments.map((shipment, sIdx) => {
                                            // Status indices for timeline
                                            const statusOrder = ['confirmed', 'shipped', 'delivered'];
                                            const currentIdx = statusOrder.indexOf(shipment.status) !== -1 ? statusOrder.indexOf(shipment.status) : (shipment.status === 'confirmed' ? 0 : -1);
                                            
                                            return (
                                                <div key={sIdx} className="space-y-6 border-b border-border pb-6 last:border-0 last:pb-0">
                                                    {order.shipments.length > 1 && (
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <div className="w-6 h-6 rounded bg-primary text-white text-[10px] font-black flex items-center justify-center shadow-sm shadow-primary/20">{sIdx + 1}</div>
                                                            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Package {sIdx + 1}</p>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Timeline Content */}
                                                    <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-muted-foreground/10">
                                                        {/* Ordered */}
                                                        <div className="relative">
                                                            <div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white z-1 shadow-lg shadow-emerald-200">
                                                                <CheckCircle className="w-3.5 h-3.5" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <p className="text-[10px] font-black uppercase tracking-wider text-foreground">Order Placed</p>
                                                                <p className="text-[9px] text-muted-foreground italic font-medium">{formatDate(order.createdAt)}</p>
                                                            </div>
                                                        </div>

                                                        {/* Confirmed */}
                                                        <div className="relative">
                                                            <div className={`absolute -left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-white z-1 shadow-lg ${currentIdx >= 0 ? 'bg-emerald-500 shadow-emerald-200' : 'bg-muted text-muted-foreground shadow-none'}`}>
                                                                {currentIdx >= 0 ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <p className={`text-[10px] font-black uppercase tracking-wider ${currentIdx >= 0 ? 'text-foreground' : 'text-muted-foreground opacity-50'}`}>Confirmed by Seller</p>
                                                                {shipment.status === 'confirmed' && (
                                                                     <p className="text-[9px] text-muted-foreground italic font-medium">Ready for pickup</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Shipped */}
                                                        <div className="relative">
                                                            <div className={`absolute -left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-white z-1 shadow-lg ${currentIdx >= 1 ? 'bg-indigo-500 shadow-indigo-200' : 'bg-muted text-muted-foreground shadow-none'}`}>
                                                                {currentIdx >= 1 ? <Truck className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <p className={`text-[10px] font-black uppercase tracking-wider ${currentIdx >= 1 ? 'text-foreground' : 'text-muted-foreground opacity-50'}`}>Shipped & In Transit</p>
                                                                {shipment.courier && (
                                                                    <p className="text-[9px] text-muted-foreground mt-1 flex items-center gap-1.5">
                                                                        <Info className="w-3 h-3" /> via <span className="font-black text-foreground">{shipment.courier}</span>
                                                                    </p>
                                                                )}
                                                                {shipment.trackingId && (
                                                                    <div className="mt-3 flex items-center gap-2">
                                                                        <div className="relative group">
                                                                            <code className="text-[10px] bg-muted px-2.5 py-1.5 rounded-lg font-mono font-black text-primary border border-border group-hover:border-primary/30 transition-colors">{shipment.trackingId}</code>
                                                                        </div>
                                                                        <button 
                                                                            onClick={() => {
                                                                                navigator.clipboard.writeText(shipment.trackingId!);
                                                                                toast.success("Tracking ID copied!");
                                                                            }} 
                                                                            className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                                                                        >
                                                                            <ExternalLink className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Delivered */}
                                                        <div className="relative">
                                                            <div className={`absolute -left-8 top-1 w-6 h-6 rounded-full flex items-center justify-center text-white z-1 shadow-lg ${currentIdx >= 2 ? 'bg-green-500 shadow-green-200' : 'bg-muted text-muted-foreground shadow-none'}`}>
                                                                {currentIdx >= 2 ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <p className={`text-[10px] font-black uppercase tracking-wider ${currentIdx >= 2 ? 'text-foreground' : 'text-muted-foreground opacity-50'}`}>Delivered Successfully</p>
                                                                {currentIdx >= 2 && <p className="text-[9px] text-emerald-600 font-bold italic mt-1">Status: COMPLETED</p>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                                            <Clock className="w-8 h-8 text-muted-foreground/30" />
                                        </div>
                                        <div className="max-w-[200px] mx-auto">
                                            <p className="text-xs text-muted-foreground font-bold leading-relaxed">Tracking will be available once the seller confirms the order.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary Pricing */}
                        <div className="bg-background rounded-3xl border border-border shadow-sm p-6 space-y-4">
                            <h3 className="font-serif font-bold border-b border-border pb-3 mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                                <CreditCard className="w-4 h-4 text-emerald-500" /> Order Summary
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground font-medium">Items Total</span>
                                    <span className="font-black text-emerald-600">₹{order.pricing.subtotal.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-xs border-b border-border pb-3">
                                    <span className="text-muted-foreground font-medium">Delivery Charge</span>
                                    <span className="font-black text-foreground">₹{(order.pricing.deliveryCharge || 0).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="font-black text-[11px] uppercase tracking-widest text-primary">Amount Paid</span>
                                    <span className="text-2xl font-black text-emerald-600 tracking-tighter">₹{order.pricing.total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
