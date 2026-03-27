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
    trackingInfo?: {
        courier?: string;
        trackingId?: string;
        shippedAt?: string;
        shiprocketShipmentId?: string;
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
    const [pickupLocations, setPickupLocations] = useState<any[]>([]);
    const [selectedPickup, setSelectedPickup] = useState('');
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

        const fetchPickupLocations = async () => {
            try {
                const res = await api.get<any>('/api/orders/shiprocket/pickup-locations');
                if (res.data?.shipping_address) {
                    setPickupLocations(res.data.shipping_address);
                    // Default to first primary if available
                    if (res.data.shipping_address.length > 0) {
                        setSelectedPickup(res.data.shipping_address[0].pickup_location);
                    }
                }
            } catch (err) {
                console.warn("Failed to load Shiprocket pickup locations", err);
            }
        };

        if (user && user.role === 'seller') {
            fetchOrders();
            fetchPickupLocations();
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
            
            // Refresh balance if delivered
            if (newStatus === 'delivered') {
                await validateToken();
            }

            setSelectedOrder(null);
            setCourier('');
            setTrackingId('');
        } catch (err: any) {
            toast.error(err.message || "Failed to update order status");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleShipWithShiprocket = async (orderId: string) => {
        setIsUpdating(true);
        try {
            const res = await api.post<any>(`/api/orders/${orderId}/process-shipment`, {
                pickup_location: selectedPickup
            });
            toast.success("AWB assigned! Now schedule the pickup.");
            
            // Refresh orders
            const data = await api.get<Order[]>('/api/orders/seller');
            setOrders(data);
            
            setSelectedOrder(null);
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "Shiprocket integration failed. Check credentials.");
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

                                        {order.trackingInfo && (
                                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Truck className="w-4 h-4 text-primary" />
                                                    <span className="text-[10px] font-black uppercase text-primary tracking-widest">In Transit</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm font-bold text-zinc-900">{order.trackingInfo.courier}</p>
                                                        <p className="text-xs text-zinc-500 font-mono mt-0.5">{order.trackingInfo.trackingId}</p>
                                                    </div>
                                                    {order.trackingInfo.shiprocketShipmentId && (
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
                                        {order.status === 'confirmed' && (
                                            <Button 
                                                onClick={() => handleUpdateStatus(order._id, 'processing')}
                                                className="flex-1 rounded-xl h-11 font-bold text-xs"
                                                variant="secondary"
                                                disabled={isUpdating}
                                            >
                                                Acknowledge
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
                                        {order.status === 'shipped' && order.trackingInfo?.shiprocketShipmentId && (
                                            <Button 
                                                onClick={() => handleSchedulePickup(order._id)}
                                                className="flex-1 rounded-xl h-11 font-bold bg-primary text-white text-xs shadow-lg shadow-primary/10"
                                                disabled={isUpdating}
                                            >
                                                <Truck className="w-4 h-4 mr-2" /> Schedule Pickup
                                            </Button>
                                        )}
                                        {order.status === 'pickup_scheduled' && (
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

            {/* Ship Order Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-zinc-100 bg-zinc-50/50">
                            <h2 className="text-2xl font-serif font-black text-zinc-900 leading-tight">Shipment Fulfillment</h2>
                            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Order Ref: #{selectedOrder._id.slice(-8).toUpperCase()}</p>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Method 1: Automated (Recommended) */}
                            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 relative overflow-hidden group">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                                            <Truck className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-primary">Ship via Shiprocket</span>
                                        <span className="ml-auto bg-primary/10 text-[9px] font-black text-primary px-2 py-0.5 rounded-full uppercase tracking-tighter">Recommended</span>
                                    </div>
                                    <p className="text-sm text-zinc-600 font-medium mb-4">Automate label generation, AWB assignment, and real-time tracking for this order with 1-click.</p>
                                    
                                    {pickupLocations.length > 0 ? (
                                        <div className="mb-6 space-y-2">
                                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Select Pickup Point</label>
                                            <select 
                                                value={selectedPickup} 
                                                onChange={e => setSelectedPickup(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-primary/20 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all font-bold text-sm"
                                            >
                                                {pickupLocations.map((loc: any) => (
                                                    <option key={loc.id} value={loc.pickup_location}>
                                                        {loc.pickup_location} ({loc.city})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="mb-6 p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-2 items-start">
                                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                                            <p className="text-[10px] text-amber-800 font-medium leading-tight">
                                                No verified pickup locations found in Shiprocket dashboard. Please add one first or complete onboarding.
                                            </p>
                                        </div>
                                    )}

                                    <Button 
                                        onClick={() => handleShipWithShiprocket(selectedOrder._id)}
                                        className="w-full rounded-xl h-12 font-black shadow-lg shadow-primary/20"
                                        disabled={isUpdating || !selectedPickup}
                                    >
                                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fulfill with Shiprocket"}
                                    </Button>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Truck className="w-24 h-24 rotate-12" />
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-100" /></div>
                                <div className="relative flex justify-center text-[10px] uppercase font-black text-zinc-300 tracking-widest bg-white px-4">Or Manual Entry</div>
                            </div>

                            {/* Method 2: Manual */}
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                if (selectedOrder) {
                                    handleUpdateStatus(selectedOrder._id, 'shipped', { courier, trackingId });
                                }
                            }} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">Courier Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all font-bold text-sm" 
                                        placeholder="e.g. BlueDart, DTDC, XpressBees"
                                        value={courier}
                                        onChange={e => setCourier(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">Manifest / AWB Number</label>
                                    <input 
                                        type="text" 
                                        required 
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all font-mono font-bold text-sm" 
                                        placeholder="Enter Tracking ID"
                                        value={trackingId}
                                        onChange={e => setTrackingId(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <Button type="button" variant="ghost" onClick={() => setSelectedOrder(null)} className="flex-1 rounded-xl h-11 font-bold text-xs">Cancel</Button>
                                    <Button type="submit" className="flex-1 rounded-xl h-11 font-bold bg-zinc-900 text-white hover:bg-zinc-800 text-xs" disabled={isUpdating}>
                                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Manual Ship'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
