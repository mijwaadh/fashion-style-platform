'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Clock, CheckCircle, Truck, X, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface OrderItem { name: string; imageUrl: string; price: number; quantity: number; size?: string; color?: string; }
interface Order {
    _id: string;
    items: OrderItem[];
    shippingAddress: { fullName: string; line1: string; city: string; state: string; pincode: string; };
    pricing: { subtotal: number; platformFee: number; gst: number; total: number; };
    status: string;
    payment: { status: string; };
    trackingInfo?: {
        courier?: string;
        trackingId?: string;
    };
    createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
    pending_payment: { label: 'Awaiting Payment', icon: Clock,        color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    confirmed:       { label: 'Confirmed',         icon: CheckCircle,  color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    processing:      { label: 'Processing',        icon: Package,      color: 'bg-blue-100 text-blue-700 border-blue-200' },
    shipped:         { label: 'Shipped',           icon: Truck,        color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    delivered:       { label: 'Delivered',         icon: CheckCircle,  color: 'bg-green-100 text-green-700 border-green-200' },
    cancelled:       { label: 'Cancelled',         icon: X,            color: 'bg-red-100 text-red-700 border-red-200' },
    refunded:        { label: 'Refunded',          icon: X,            color: 'bg-orange-100 text-orange-700 border-orange-200' },
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<Order[]>('/api/orders/my')
            .then(setOrders)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-muted/30 pb-20">
            <header className="bg-background border-b border-border sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
                    <h1 className="font-serif text-xl font-bold">My Orders</h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 mt-8 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 bg-background rounded-2xl border border-border shadow-sm">
                        <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                        <h3 className="font-serif text-2xl font-bold mb-2">No Orders Yet</h3>
                        <p className="text-muted-foreground mb-6">Start shopping to see your orders here.</p>
                        <Button asChild variant="default" className="rounded-full px-8"><Link href="/">Browse Products</Link></Button>
                    </div>
                ) : orders.map(order => {
                    const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['confirmed'];
                    const StatusIcon = statusCfg.icon;
                    return (
                        <div key={order._id} className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
                            {/* Order Header */}
                            <Link href={`/account/orders/${order._id}`} className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/20 hover:bg-muted/30 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-primary shadow-sm border border-border group-hover:scale-110 transition-transform">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Order ID</p>
                                        <p className="font-mono text-sm font-bold text-foreground">#{order._id.slice(-8).toUpperCase()}</p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                        <div className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${statusCfg.color}`}>
                                            <StatusIcon className="w-2.5 h-2.5" />{statusCfg.label}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>

                            {/* Items */}
                            <div className="px-5 py-4 space-y-3">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-3">
                                        <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="56px" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                                            <div className="flex gap-1.5 mt-0.5 flex-wrap">
                                                {item.size && <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{item.size}</Badge>}
                                                {item.color && <Badge variant="secondary" className="text-[9px] px-1.5 py-0">{item.color}</Badge>}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
                                        </div>
                                        <p className="font-bold text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between px-5 py-3 bg-muted/20 border-t border-border">
                                <p className="text-xs text-muted-foreground">
                                    Deliver to: <span className="font-medium text-foreground">{order.shippingAddress.fullName}, {order.shippingAddress.city}</span>
                                </p>
                                <div className="flex flex-col items-end gap-2">
                                    <p className="font-bold text-foreground">₹{order.pricing.total.toLocaleString('en-IN')}</p>
                                    {order.status !== 'cancelled' && (
                                        <Button asChild size="sm" variant="outline" className="h-9 rounded-full text-[10px] font-black uppercase tracking-[0.1em] gap-2 border-primary/20 hover:border-primary hover:bg-primary/5 text-primary transition-all">
                                            <Link href={`/account/orders/${order._id}`}>
                                                <Truck className="w-3.5 h-3.5" /> Track & Details
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </main>
        </div>
    );
}
