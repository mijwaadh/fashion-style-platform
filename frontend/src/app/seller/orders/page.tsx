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
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'pickup_scheduled' | 'delivered' | 'cancelled';
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
    shipments: {
        sellerId: string;
        courier?: string;
        trackingId?: string;
        shippedAt?: string;
        shiprocketOrderId?: string;
        shiprocketShipmentId?: string;
        status: 'shipped' | 'pickup_scheduled' | 'delivered';
    }[];
    createdAt: string;
}

export default function SellerOrders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'shipped' | 'completed'>('all');
    
    const [isUpdating, setIsUpdating] = useState(false);
    const { validateToken } = useAuth();

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
        if (filter === 'pending') return o.status === 'pending';
        if (filter === 'confirmed') return o.status === 'confirmed';
        if (filter === 'shipped') return o.status === 'shipped' || o.status === 'pickup_scheduled';
        if (filter === 'completed') return o.status === 'delivered';
        return true;
    });

    const handleUpdateStatus = async (orderId: string, newStatus: string, payload: any = {}) => {
        setIsUpdating(true);
        try {
            const updated = await api.put<Order>(`/api/orders/${orderId}/status`, { status: newStatus, ...payload });
            setOrders(orders.map(o => o._id === orderId ? updated : o));
            toast.success(`Order marked as ${newStatus}`);
            
            // Refresh balance if delivered
            if (newStatus === 'delivered') {
                await validateToken();
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to update order status");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleConfirmOrder = async (orderId: string) => {
        setIsUpdating(true);
        try {
            const res = await api.post<any>(`/api/orders/${orderId}/confirm`, {});
            toast.success("Order confirmed and created in Shiprocket!");
            
            // Refresh orders
            const data = await api.get<Order[]>('/api/orders/seller');
            setOrders(data);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to confirm order.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAssignAWB = async (orderId: string) => {
        setIsUpdating(true);
        try {
            const res = await api.post<any>(`/api/orders/${orderId}/process-shipment`, {});
            toast.success("AWB assigned successfully!");
            
            // Refresh orders
            const data = await api.get<Order[]>('/api/orders/seller');
            setOrders(data);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to assign AWB.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSchedulePickup = async (orderId: string) => {
        setIsUpdating(true);
        try {
            const res = await api.post<any>(`/api/orders/${orderId}/schedule-pickup`, {});
            toast.success("Pickup scheduled successfully! A courier will arrive soon.");
            
            const data = await api.get<Order[]>('/api/orders/seller');
            setOrders(data);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Failed to schedule pickup.");
        } finally {
            setIsUpdating(false);
        }
    };
 
    const handleDownloadLabel = async (orderId: string) => {
        try {
            const data = await api.get<any>(`/api/orders/${orderId}/label`);
            if (data.label_url) {
                window.open(data.label_url, '_blank');
            } else {
                toast.error("Label URL not found in Shiprocket response.");
            }
        } catch (err: any) {
            toast.error("Failed to fetch shipping label.");
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles: any = {
            pending:    "bg-gray-50 text-gray-700 border-gray-100",
            confirmed:  "bg-blue-50 text-blue-700 border-blue-100",
            processing: "bg-amber-50 text-amber-700 border-amber-100",
            shipped:    "bg-purple-50 text-purple-700 border-purple-100",
            pickup_scheduled: "bg-emerald-50 text-emerald-700 border-emerald-100",
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
        <div className="pb-20 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-foreground">Order Management</h1>
                    <p className="text-muted-foreground mt-2">Track and fulfill orders for your products.</p>
                </div>

                <div className="flex bg-background p-1.5 rounded-xl border border-zinc-200 shadow-sm">
                    {(['all', 'pending', 'confirmed', 'shipped', 'completed'] as const).map((f) => (
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
                <div className="py-20 bg-white rounded-3xl border border-dashed border-zinc-200 flex flex-col items-center gap-4 text-center">
                    <div className="p-4 bg-muted rounded-full text-muted-foreground"><Package className="w-8 h-8 opacity-20" /></div>
                    <div>
                        <p className="font-bold text-foreground text-lg">No orders found</p>
                        <p className="text-sm text-muted-foreground">When customers buy your products, they will appear here.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredOrders.map(order => (
                        <div key={order._id} className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-white rounded-xl border border-zinc-200"><Package className="w-5 h-5 text-primary" /></div>
                                    <div>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Order Ref</p>
                                        <p className="text-sm font-black text-zinc-900 leading-none">#{order._id.slice(-8).toUpperCase()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="hidden sm:block">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Placed On</p>
                                        <p className="text-sm font-bold text-zinc-900 leading-none">{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                    <StatusBadge status={order.status} />
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Items */}
                                <div className="lg:col-span-7 space-y-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-zinc-50/50 border border-zinc-100">
                                            <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0">
                                                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-zinc-900 leading-tight truncate">{item.name}</h4>
                                                <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-tight">
                                                    Qty: <span className="text-zinc-900">{item.quantity}</span>
                                                    {item.size && <span className="ml-2">| Size: <span className="text-zinc-900">{item.size}</span></span>}
                                                </p>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <div className="px-2 py-1 bg-emerald-50 text-[10px] font-bold text-emerald-700 rounded-md border border-emerald-100 leading-none">
                                                        Your Share: ₹{(item.sellerShare || 0).toLocaleString()}
                                                    </div>
                                                    <p className="text-sm font-black text-zinc-900">₹{(item.price || 0).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipping & Actions */}
                                <div className="lg:col-span-5 flex flex-col justify-between">
                                    <div className="space-y-6">
                                        <div className="p-5 rounded-2xl border border-zinc-100 bg-zinc-50/30">
                                            <div className="flex items-center gap-2 mb-3 text-zinc-400">
                                                <MapPin className="w-4 h-4" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Shipping Address</span>
                                            </div>
                                            <div className="text-sm space-y-0.5">
                                                <p className="font-bold text-zinc-900">{order.shippingAddress.fullName}</p>
                                                <p className="text-zinc-600 font-medium">{order.shippingAddress.line1}</p>
                                                {order.shippingAddress.line2 && <p className="text-zinc-600 font-medium">{order.shippingAddress.line2}</p>}
                                                <p className="text-zinc-600 font-medium">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                                                <div className="pt-2">
                                                    <a href={`tel:${order.shippingAddress.phone}`} className="text-primary font-bold text-xs flex items-center gap-1.5 hover:underline whitespace-nowrap overflow-hidden">
                                                        <User className="w-3.5 h-3.5" /> 
                                                        {order.shippingAddress.phone}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>

                                        {order.shipments?.find(s => s.sellerId === user._id) && (
                                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Truck className="w-4 h-4 text-primary" />
                                                    <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                                                        {order.shipments.find(s => s.sellerId === user._id)?.status === 'pickup_scheduled' ? 'Pickup Scheduled' : 'In Transit'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-bold text-zinc-900">{order.shipments.find(s => s.sellerId === user._id)?.courier}</p>
                                                        <p className="text-xs text-zinc-500 font-mono mt-0.5">{order.shipments.find(s => s.sellerId === user._id)?.trackingId}</p>
                                                    </div>
                                                    {order.shipments.find(s => s.sellerId === user._id)?.shiprocketShipmentId && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="h-8 rounded-lg text-[10px] font-black uppercase border-primary/20 text-primary hover:bg-primary/5"
                                                            onClick={() => handleDownloadLabel(order._id)}
                                                        >
                                                            Label
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-8 flex gap-3">
                                        {order.status === 'pending' && (
                                            <Button 
                                                onClick={() => handleConfirmOrder(order._id)}
                                                className="flex-1 rounded-xl h-11 font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100"
                                                disabled={isUpdating}
                                            >
                                                <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm Order
                                            </Button>
                                        )}
                                        {order.status === 'confirmed' && !order.shipments?.find(s => s.sellerId === user._id)?.trackingId && (
                                            <Button 
                                                onClick={() => handleAssignAWB(order._id)}
                                                className="flex-1 rounded-xl h-11 font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-100"
                                                disabled={isUpdating}
                                            >
                                                <Truck className="w-4 h-4 mr-2" /> Assign AWB
                                            </Button>
                                        )}
                                        {order.shipments?.find(s => s.sellerId === user._id)?.status === 'shipped' && (
                                            <Button 
                                                onClick={() => handleSchedulePickup(order._id)}
                                                className="flex-1 rounded-xl h-11 font-bold bg-primary text-white text-xs shadow-lg shadow-primary/10"
                                                disabled={isUpdating}
                                            >
                                                <Truck className="w-4 h-4 mr-2" /> Schedule Pickup
                                            </Button>
                                        )}
                                        {order.shipments?.find(s => s.sellerId === user._id)?.status === 'pickup_scheduled' && (
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
        </div>
    );
}
