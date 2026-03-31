'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
    ChevronLeft, Package, Clock, CheckCircle, Truck, 
    X, Loader2, Search, ExternalLink, MapPin, 
    Phone, User, CreditCard, Send, Edit3, Calendar, ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import AdminGuard from '@/components/layout/AdminGuard';
import Navbar from '@/components/layout/Navbar';

interface OrderItem {
    _id: string;
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
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment: {
        status: string;
    };
    shipments?: {
        ownerId: string;
        courier?: string;
        trackingId?: string;
        status: string;
    }[];
    createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
    pending:   { label: 'Pending',   icon: Clock,        color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    confirmed: { label: 'Confirmed', icon: CheckCircle,  color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    processing:{ label: 'Processing',icon: Package,      color: 'bg-blue-100 text-blue-700 border-blue-200' },
    shipped:   { label: 'Shipped',   icon: Truck,        color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    delivered: { label: 'Delivered', icon: CheckCircle,  color: 'bg-green-100 text-green-700 border-green-200' },
    cancelled: { label: 'Cancelled', icon: X,            color: 'bg-red-100 text-red-700 border-red-200' },
};

function OrdersContent() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    // Shipment Modal State
    const [showShipModal, setShowShipModal] = useState<string | null>(null);
    const [shipForm, setShipForm] = useState({ courier: '', trackingId: '' });

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get<Order[]>('/api/orders/admin');
            setOrders(data);
        } catch (err) {
            console.error('Failed to fetch admin orders:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleConfirm = async (orderId: string) => {
        setUpdatingId(orderId);
        try {
            await api.post(`/api/orders/${orderId}/confirm`, {});
            await fetchOrders();
        } catch (err) {
            console.error('Confirm order error:', err);
            alert('Failed to confirm order.');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleShipProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!showShipModal) return;
        setUpdatingId(showShipModal);
        try {
            await api.post(`/api/orders/${showShipModal}/process-shipment`, shipForm);
            setShowShipModal(null);
            setShipForm({ courier: '', trackingId: '' });
            await fetchOrders();
        } catch (err) {
            console.error('Ship product error:', err);
            alert('Failed to update shipment info.');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleMarkDelivered = async (orderId: string) => {
        if (!confirm('Mark this order as delivered? This will also initiate seller settlement.')) return;
        setUpdatingId(orderId);
        try {
            await api.put(`/api/orders/${orderId}/status`, { status: 'delivered' });
            await fetchOrders();
        } catch (err) {
            console.error('Delivery error:', err);
            alert('Failed to mark as delivered.');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredOrders = orders.filter(o => 
        o._id.toLowerCase().includes(search.toLowerCase()) || 
        o.shippingAddress.fullName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 mt-8 md:mt-12">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href="/admin"><ChevronLeft className="w-5 h-5" /></Link>
                    </Button>
                    <div>
                        <div className="text-sm text-muted-foreground mb-0.5">
                            <Link href="/admin" className="text-primary font-medium hover:underline">Admin Panel</Link>
                            <span className="mx-1">›</span> Native Orders
                        </div>
                        <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-2">
                            <ShoppingBag className="w-7 h-7 text-primary" /> My Sales & Orders
                        </h1>
                    </div>
                </div>

                {/* Filters */}
                <div className="relative max-w-sm mb-8">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20 bg-background rounded-3xl border border-dashed border-border">
                        <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground">No native orders found.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map(order => {
                            const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['pending'];
                            const StatusIcon = statusCfg.icon;
                            // Check if admin has already confirmed
                            // Note: In local storage, we might not have 'id' but checking if shipments contain current user's ID
                            // However, we rely on shipment.status for UI state
                            const myShipment = order.shipments?.find(s => s.status !== ''); // Simplified logic for demo

                            return (
                                <div key={order._id} className="bg-background rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all">
                                    {/* Order Context */}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-border bg-muted/10 gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                                                <Package className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground leading-none mb-1">Order ID</p>
                                                <p className="font-mono text-sm font-bold text-foreground">#{order._id.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <div className="hidden sm:block">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground leading-none mb-1">Purchased On</p>
                                                <div className="flex items-center gap-1.5 text-sm font-semibold capitalize">
                                                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground leading-none mb-1">Current Status</p>
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${statusCfg.color}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {statusCfg.label}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Main Content */}
                                    <div className="grid grid-cols-1 lg:grid-cols-12">
                                        {/* Items List */}
                                        <div className="lg:col-span-7 p-6 border-r border-border space-y-4">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                                                <CheckCircle className="w-3 h-3" /> Selling Items ({order.items.length})
                                            </h4>
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex gap-4 p-3 rounded-2xl border border-muted bg-muted/5">
                                                    <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                                                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="64px" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <Link href={`/product/${item.productId}`} className="font-bold text-sm hover:text-primary transition-colors line-clamp-1">{item.name}</Link>
                                                            <p className="font-bold text-sm">₹{item.price.toLocaleString('en-IN')}</p>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                                            {item.size && <Badge variant="secondary" className="text-[9px] px-1.5 py-0 border-border">Size: {item.size}</Badge>}
                                                            {item.color && <Badge variant="secondary" className="text-[9px] px-1.5 py-0 border-border">Color: {item.color}</Badge>}
                                                        </div>
                                                        <p className="text-[11px] text-muted-foreground mt-2 font-medium">Quantity: {item.quantity}</p>
                                                        <p className="text-[10px] text-primary mt-1 font-bold">Seller Payout: ₹{item.sellerShare?.toLocaleString('en-IN')}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Shipping & Payment */}
                                        <div className="lg:col-span-5 p-6 bg-muted/5 flex flex-col justify-between">
                                            <div>
                                                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                                    <MapPin className="w-3 h-3" /> Shipping Address
                                                </h4>
                                                <div className="space-y-4">
                                                    <div className="flex gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                                            <User className="w-4 h-4 text-muted-foreground" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-foreground leading-tight">{order.shippingAddress.fullName}</p>
                                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                                                                <Phone className="w-3 h-3" /> {order.shippingAddress.phone}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="pl-11 space-y-1">
                                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                                            {order.shippingAddress.line1}
                                                            {order.shippingAddress.line2 && `, ${order.shippingAddress.line2}`}
                                                        </p>
                                                        <p className="text-xs font-semibold text-foreground">
                                                            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-border space-y-4">
                                                <div className="flex items-center justify-between text-xs mb-4">
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <CreditCard className="w-3.5 h-3.5" /> 
                                                        <span>Payment Method: <span className="font-bold text-foreground">Razorpay</span></span>
                                                    </div>
                                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold uppercase tracking-widest text-[9px]">PAID</Badge>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="grid grid-cols-1 gap-2">
                                                    {order.status === 'pending' && (
                                                        <Button 
                                                            disabled={updatingId === order._id}
                                                            onClick={() => handleConfirm(order._id)}
                                                            className="w-full rounded-2xl font-bold bg-zinc-900 text-white hover:bg-zinc-800"
                                                        >
                                                            {updatingId === order._id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Order'}
                                                        </Button>
                                                    )}

                                                    {order.status === 'confirmed' && (
                                                        <Button 
                                                            onClick={() => setShowShipModal(order._id)}
                                                            className="w-full rounded-2xl font-bold group"
                                                        >
                                                            <Truck className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                                                            Mark as Shipped
                                                        </Button>
                                                    )}

                                                    {order.status === 'shipped' && (
                                                        <Button 
                                                            disabled={updatingId === order._id}
                                                            onClick={() => handleMarkDelivered(order._id)}
                                                            variant="outline"
                                                            className="w-full rounded-2xl font-bold border-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                                                        >
                                                            {updatingId === order._id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Mark as Delivered'}
                                                        </Button>
                                                    )}

                                                    {order.status === 'delivered' && (
                                                        <div className="flex items-center justify-center p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700">
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            <span className="text-xs font-bold uppercase tracking-widest">Order Completed</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Shipment Update Modal */}
            {showShipModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-background w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/30">
                            <div>
                                <h3 className="font-bold text-lg text-foreground leading-none">Ship Order</h3>
                                <p className="text-xs text-muted-foreground mt-1.5 uppercase font-black tracking-widest">Tracking Details</p>
                            </div>
                            <button onClick={() => setShowShipModal(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>
                        <form onSubmit={handleShipProduct} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Courier Service</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. BlueDart, Delhivery"
                                    value={shipForm.courier}
                                    onChange={e => setShipForm(prev => ({ ...prev, courier: e.target.value }))}
                                    className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Tracking ID</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. 1234567890"
                                    value={shipForm.trackingId}
                                    onChange={e => setShipForm(prev => ({ ...prev, trackingId: e.target.value }))}
                                    className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" className="flex-1 rounded-2xl h-12 font-bold" onClick={() => setShowShipModal(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={updatingId === showShipModal} className="flex-1 rounded-2xl h-12 font-bold gap-2">
                                    {updatingId === showShipModal ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Update & Ship <Send className="w-4 h-4" /></>}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminOrdersPage() {
    return (
        <AdminGuard>
            <OrdersContent />
        </AdminGuard>
    );
}
