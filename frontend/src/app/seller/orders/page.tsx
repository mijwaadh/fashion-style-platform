'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { Loader2, Package, Truck, CheckCircle2, AlertCircle, Search, ExternalLink, Calendar, MapPin, User, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Image from 'next/image';

interface OrderItem {
    productId: string;
    name: string;
    imageUrl: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    sellerShare: number;
}

interface Order {
    _id: string;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    items: OrderItem[];
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
        total: number;
    };
    trackingInfo?: {
        courier?: string;
        trackingId?: string;
        shippedAt?: string;
    };
    createdAt: string;
}

export default function SellerOrders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'shipped' | 'completed'>('all');
    
    // Modal state for shipping
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [courier, setCourier] = useState('');
    const [trackingId, setTrackingId] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await api.get<Order[]>('/api/orders/seller');
                setOrders(data);
            } catch (err) {
                console.error("Failed to load seller orders", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && user.role === 'seller') {
            fetchOrders();
        }
    }, [user]);

    if (!user || user.role !== 'seller') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const filteredOrders = orders.filter(o => {
        if (filter === 'all') return true;
        if (filter === 'pending') return ['confirmed', 'processing'].includes(o.status);
        if (filter === 'shipped') return o.status === 'shipped';
        if (filter === 'completed') return o.status === 'delivered';
        return true;
    });

    const handleUpdateStatus = async (orderId: string, newStatus: string, payload: any = {}) => {
        setIsUpdating(true);
        try {
            const updated = await api.put<Order>(`/api/orders/${orderId}/status`, { status: newStatus, ...payload });
            setOrders(orders.map(o => o._id === orderId ? updated : o));
            toast.success(`Order marked as ${newStatus}`);
            setSelectedOrder(null);
            setCourier('');
            setTrackingId('');
        } catch (err: any) {
            toast.error(err.message || "Failed to update order status");
        } finally {
            setIsUpdating(false);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: any = {
            confirmed:  "bg-blue-50 text-blue-700 border-blue-100",
            processing: "bg-amber-50 text-amber-700 border-amber-100",
            shipped:    "bg-purple-50 text-purple-700 border-purple-100",
            delivered:  "bg-green-50 text-green-700 border-green-100",
            cancelled:  "bg-rose-50 text-rose-700 border-rose-100",
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || 'bg-muted text-muted-foreground border-border'}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 mt-8 md:mt-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-foreground">Order Management</h1>
                        <p className="text-muted-foreground mt-2">Track and fulfill orders for your products.</p>
                    </div>

                    <div className="flex bg-background p-1.5 rounded-xl border border-border shadow-sm">
                        {(['all', 'pending', 'shipped', 'completed'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 text-xs font-bold capitalize rounded-lg transition-all ${
                                    filter === f ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-muted'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary/30" /></div>
                ) : filteredOrders.length === 0 ? (
                    <div className="py-20 bg-background rounded-3xl border border-dashed border-border flex flex-col items-center gap-4 text-center">
                        <div className="p-4 bg-muted rounded-full text-muted-foreground"><Package className="w-8 h-8 opacity-20" /></div>
                        <div>
                            <p className="font-bold text-foreground">No orders found</p>
                            <p className="text-sm text-muted-foreground">When customers buy your products, they will appear here.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredOrders.map(order => (
                            <div key={order._id} className="bg-background rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div className="p-6 border-b border-border/60 bg-muted/10 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-background rounded-xl border border-border"><Package className="w-5 h-5 text-primary" /></div>
                                        <div>
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Order ID</p>
                                            <p className="text-sm font-black text-foreground">#{order._id.slice(-8).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="hidden sm:block">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Placed On</p>
                                            <p className="text-sm font-bold text-foreground">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                        <StatusBadge status={order.status} />
                                    </div>
                                </div>

                                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    {/* Items */}
                                    <div className="lg:col-span-7 space-y-4">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-muted/30 border border-border/40">
                                                <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                                                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-foreground leading-tight truncate">{item.name}</h4>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Qty: <span className="font-bold text-foreground">{item.quantity}</span>
                                                        {item.size && <span className="ml-2">| Size: <span className="font-bold text-foreground">{item.size}</span></span>}
                                                    </p>
                                                    <div className="mt-4 flex items-center justify-between">
                                                        <div className="px-2 py-1 bg-green-50 text-[10px] font-bold text-green-700 rounded-md">
                                                            Your Share: ₹{(item.sellerShare || 0).toLocaleString()}
                                                        </div>
                                                        <p className="text-sm font-black text-foreground">₹{(item.price || 0).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Shipping & Actions */}
                                    <div className="lg:col-span-5 flex flex-col justify-between">
                                        <div className="space-y-6">
                                            <div>
                                                <div className="flex items-center gap-2 mb-3 text-muted-foreground">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Shipping Address</span>
                                                </div>
                                                <div className="text-sm space-y-0.5">
                                                    <p className="font-bold text-foreground">{order.shippingAddress.fullName}</p>
                                                    <p className="text-muted-foreground">{order.shippingAddress.line1}</p>
                                                    {order.shippingAddress.line2 && <p className="text-muted-foreground">{order.shippingAddress.line2}</p>}
                                                    <p className="text-muted-foreground">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                                                    <p className="text-primary font-bold mt-2 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {order.shippingAddress.phone}</p>
                                                </div>
                                            </div>

                                            {order.trackingInfo && (
                                                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Truck className="w-4 h-4 text-primary" />
                                                        <span className="text-[10px] font-black uppercase text-primary">Tracking Information</span>
                                                    </div>
                                                    <p className="text-sm font-bold text-foreground">{order.trackingInfo.courier}</p>
                                                    <p className="text-xs text-muted-foreground font-mono mt-1">{order.trackingInfo.trackingId}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-8 flex gap-3">
                                            {order.status === 'confirmed' && (
                                                <Button 
                                                    onClick={() => handleUpdateStatus(order._id, 'processing')}
                                                    className="flex-1 rounded-xl h-11 font-bold text-xs"
                                                    variant="secondary"
                                                    disabled={isUpdating}
                                                >
                                                    Acknowledge Order
                                                </Button>
                                            )}
                                            {(order.status === 'confirmed' || order.status === 'processing') && (
                                                <Button 
                                                    onClick={() => setSelectedOrder(order)}
                                                    className="flex-1 rounded-xl h-11 font-bold text-xs"
                                                    disabled={isUpdating}
                                                >
                                                    <Truck className="w-4 h-4 mr-2" /> Mark Shipped
                                                </Button>
                                            )}
                                            {order.status === 'shipped' && (
                                                <Button 
                                                    onClick={() => handleUpdateStatus(order._id, 'delivered')}
                                                    className="flex-1 rounded-xl h-11 font-bold bg-green-600 hover:bg-green-700 text-xs shadow-lg shadow-green-100"
                                                    disabled={isUpdating}
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm Delivery
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Ship Order Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
                    <div className="relative bg-background rounded-3xl border border-border shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-serif font-bold text-foreground mb-2">Ship Order</h2>
                        <p className="text-sm text-muted-foreground mb-6 font-medium">Please provide the tracking details for shipment #{selectedOrder._id.slice(-8).toUpperCase()}</p>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            handleUpdateStatus(selectedOrder._id, 'shipped', { courier, trackingId });
                        }} className="space-y-5">
                            <div>
                                <label className="text-xs font-bold text-foreground uppercase tracking-widest block mb-1.5">Courier Partner</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all font-bold" 
                                    placeholder="e.g. BlueDart, Shiprocket, DTDC"
                                    value={courier}
                                    onChange={e => setCourier(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-foreground uppercase tracking-widest block mb-1.5">Tracking ID / AWB</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="w-full px-4 py-3 bg-muted/40 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all font-mono font-bold" 
                                    placeholder="e.g. 1234567890"
                                    value={trackingId}
                                    onChange={e => setTrackingId(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setSelectedOrder(null)} className="flex-1 rounded-xl h-12 font-bold">Cancel</Button>
                                <Button type="submit" className="flex-1 rounded-xl h-12 font-bold shadow-lg shadow-primary/20" disabled={isUpdating}>
                                    {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Shipment'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
