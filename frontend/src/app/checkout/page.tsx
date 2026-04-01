'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CheckCircle, MapPin, CreditCard, ShoppingBag, Plus, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useCart } from '@/context/CartContext';

declare global {
    interface Window { Razorpay: any; }
}

interface Address {
    _id: string; label: string; fullName: string; phone: string;
    line1: string; line2?: string; pincode: string; city: string; state: string; isDefault?: boolean;
}

const STEPS = ['Bag', 'Address', 'Payment'];
const DELIVERY_CHARGE = 50;

export default function CheckoutPage() {
    const router = useRouter();
    const { items, cartTotal, refreshCart } = useCart();
    const [step, setStep] = useState(0);

    // Address state
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddr, setSelectedAddr] = useState<string>('');
    const [showAddrForm, setShowAddrForm] = useState(false);
    const [addrForm, setAddrForm] = useState({ label: 'Home', fullName: '', phone: '', line1: '', line2: '', pincode: '', city: '', state: '' });

    // Payment state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Pricing
    const total = cartTotal + DELIVERY_CHARGE;

    useEffect(() => {
        const userStr = sessionStorage.getItem('aura_user');
        if (!userStr) { router.push('/auth/login'); return; }
        fetchAddresses();
    }, []);

    // Load Razorpay script
    useEffect(() => {
        if (typeof window !== 'undefined' && !window.Razorpay) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            document.body.appendChild(script);
        }
    }, []);

    const fetchAddresses = async () => {
        try {
            const data = await api.get<Address[]>('/api/addresses');
            setAddresses(data);
            const def = data.find(a => a.isDefault);
            if (def) setSelectedAddr(def._id);
        } catch { }
    };

    const submitAddress = async () => {
        try {
            await api.post('/api/addresses', addrForm);
            await fetchAddresses();
            setShowAddrForm(false);
            setAddrForm({ label: 'Home', fullName: '', phone: '', line1: '', line2: '', pincode: '', city: '', state: '' });
        } catch (err: any) { setError(err.message); }
    };

    const handlePayment = async () => {
        if (!selectedAddr) { setError('Please select a delivery address.'); return; }
        setError(''); setLoading(true);

        try {
            const { razorpayOrderId, razorpayKeyId, pricing } = await api.post<any>('/api/orders/create-payment', { addressId: selectedAddr });

            const options = {
                key:         razorpayKeyId,
                amount:      pricing.total * 100,
                currency:    'INR',
                name:        'Aura Marketplace',
                description: 'Order Payment',
                order_id:    razorpayOrderId,
                handler: async (response: any) => {
                    try {
                        await api.post('/api/orders/verify-payment', {
                            razorpayOrderId:   response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            addressId:         selectedAddr,
                        });
                        await refreshCart();
                        setSuccess(true);
                    } catch (err: any) {
                        setError(err.message || 'Payment verification failed.');
                    } finally {
                        setLoading(false);
                    }
                },
                modal: { ondismiss: () => setLoading(false) },
                theme: { color: '#7c3aed' },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30">
                <div className="bg-background rounded-3xl p-12 text-center max-w-md mx-4 border border-border shadow-xl">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Order Placed!</h1>
                    <p className="text-muted-foreground mb-8">Your payment was successful and your order is confirmed.</p>
                    <div className="flex gap-3 flex-col">
                        <Button variant="default" className="rounded-full" onClick={() => router.push('/account/orders')}>View My Orders</Button>
                        <Button variant="outline" className="rounded-full" onClick={() => router.push('/')}>Continue Shopping</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 pb-20">
            <header className="bg-background border-b border-border">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
                    <h1 className="font-serif text-xl font-bold">Checkout</h1>
                    <div className="ml-auto flex items-center gap-2">
                        {STEPS.map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <button
                                    onClick={() => i < step && setStep(i)}
                                    className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${i === step ? 'text-primary' : i < step ? 'text-emerald-600 cursor-pointer' : 'text-muted-foreground cursor-default'}`}
                                >
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${i === step ? 'bg-primary text-white border-primary' : i < step ? 'bg-emerald-600 text-white border-emerald-600' : 'border-border text-muted-foreground'}`}>
                                        {i < step ? '✓' : i + 1}
                                    </span>
                                    {s}
                                </button>
                                {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-border" />}
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left — Step Content */}
                <div className="lg:col-span-2 space-y-6">
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />{error}
                        </div>
                    )}

                    {/* ── Step 0: Bag Review ── */}
                    {step === 0 && (
                        <div className="bg-background rounded-2xl border border-border shadow-sm p-6 space-y-4">
                            <h2 className="font-semibold text-foreground flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Review Bag</h2>
                            {items.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Your bag is empty.</p>
                                </div>
                            ) : items.map(item => (
                                <div key={`${item.productId}-${item.size}-${item.color}`}
                                    className="flex gap-4 p-3 bg-muted/30 rounded-xl border border-border/50">
                                    <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="64px" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.name}</p>
                                        <div className="flex gap-2 mt-1 flex-wrap">
                                            {item.size && <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{item.size}</span>}
                                            {item.color && <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground">{item.color}</span>}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-bold text-sm text-emerald-600">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                </div>
                            ))}
                            {items.length > 0 && (
                                <Button className="w-full rounded-full" onClick={() => setStep(1)}>Continue to Address →</Button>
                            )}
                        </div>
                    )}

                    {/* ── Step 1: Address ── */}
                    {step === 1 && (
                        <div className="bg-background rounded-2xl border border-border shadow-sm p-6 space-y-4">
                            <h2 className="font-semibold text-foreground flex items-center gap-2"><MapPin className="w-4 h-4" /> Delivery Address</h2>

                            <div className="space-y-3">
                                {addresses.map(addr => (
                                    <button key={addr._id} onClick={() => setSelectedAddr(addr._id)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedAddr === addr._id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedAddr === addr._id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>{addr.label}</span>
                                            {addr.isDefault && <span className="text-[10px] text-emerald-600 font-semibold">Default</span>}
                                        </div>
                                        <p className="font-semibold text-sm">{addr.fullName} · {addr.phone}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} — {addr.pincode}</p>
                                    </button>
                                ))}
                            </div>

                            {!showAddrForm ? (
                                <button onClick={() => setShowAddrForm(true)}
                                    className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary font-medium">
                                    <Plus className="w-4 h-4" /> Add New Address
                                </button>
                            ) : (
                                <div className="p-4 rounded-xl border border-border space-y-4">
                                    <p className="font-semibold text-sm">New Address</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { key: 'fullName', label: 'Full Name', col: 2 }, { key: 'phone', label: 'Phone', col: 1 },
                                            { key: 'label', label: 'Label (Home/Work)', col: 1 }, { key: 'line1', label: 'Address Line 1', col: 2 },
                                            { key: 'line2', label: 'Line 2 (Optional)', col: 2 }, { key: 'city', label: 'City', col: 1 },
                                            { key: 'state', label: 'State', col: 1 }, { key: 'pincode', label: 'Pincode', col: 1 },
                                        ].map(f => (
                                            <div key={f.key} className={f.col === 2 ? 'col-span-2' : ''}>
                                                <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                                                <input type="text" value={(addrForm as any)[f.key]}
                                                    onChange={e => setAddrForm(p => ({ ...p, [f.key]: e.target.value }))}
                                                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="rounded-full" onClick={() => setShowAddrForm(false)}>Cancel</Button>
                                        <Button size="sm" className="rounded-full" onClick={submitAddress}>Save Address</Button>
                                    </div>
                                </div>
                            )}

                            {selectedAddr && (
                                <Button className="w-full rounded-full" onClick={() => setStep(2)}>Continue to Payment →</Button>
                            )}
                        </div>
                    )}

                    {/* ── Step 2: Payment ── */}
                    {step === 2 && (
                        <div className="bg-background rounded-2xl border border-border shadow-sm p-6 space-y-6">
                            <h2 className="font-semibold text-foreground flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment</h2>
                            {(() => {
                                const addr = addresses.find(a => a._id === selectedAddr);
                                return addr ? (
                                    <div className="p-4 bg-muted/40 rounded-xl text-sm">
                                        <p className="font-semibold">{addr.fullName}</p>
                                        <p className="text-muted-foreground">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                                        <p className="text-muted-foreground">{addr.city}, {addr.state} — {addr.pincode}</p>
                                    </div>
                                ) : null;
                            })()}
                            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
                                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="text-emerald-600 font-medium">₹{cartTotal.toLocaleString('en-IN')}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery Charge</span><span>₹{DELIVERY_CHARGE.toLocaleString('en-IN')}</span></div>
                                <div className="flex justify-between font-bold text-base border-t border-border pt-2 mt-2">
                                    <span>Total</span><span className="text-emerald-600">₹{total.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                            <Button onClick={handlePayment} disabled={loading} className="w-full rounded-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700">
                                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : `Pay ₹${total.toLocaleString('en-IN')} Securely`}
                            </Button>
                            <p className="text-[10px] text-muted-foreground text-center">
                                Secured by Razorpay · UPI · Cards · Net Banking · Wallets
                            </p>
                        </div>
                    )}
                </div>

                {/* Right — Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-background rounded-2xl border border-border shadow-sm p-5 sticky top-6">
                        <h3 className="font-semibold text-sm mb-4">Order Summary</h3>
                        <div className="space-y-3 mb-4">
                            {items.map(item => (
                                <div key={`${item.productId}-${item.size}`} className="flex gap-3">
                                    <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="48px" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium line-clamp-1">{item.name}</p>
                                        <p className="text-[10px] text-muted-foreground">×{item.quantity}</p>
                                        <p className="text-xs font-bold text-emerald-600">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-border pt-3 space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground"><span>Subtotal</span><span className="text-emerald-600 font-medium">₹{cartTotal.toLocaleString('en-IN')}</span></div>
                            <div className="flex justify-between font-bold text-sm pt-1"><span>Total</span><span className="text-emerald-600">₹{total.toLocaleString('en-IN')}</span></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
