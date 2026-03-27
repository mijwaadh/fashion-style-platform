'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { MapPin, Store, User as UserIcon, Mail, Loader2, CheckCircle2, AlertCircle, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function SellerSettingsPage() {
    const { user, loading: authLoading, validateToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form State
    const [profile, setProfile] = useState({
        storeName: '',
        name: '',
        email: '',
        businessType: '',
        pickupAddress: {
            room: '',
            street: '',
            landmark: '',
            pincode: '',
            city: '',
            state: ''
        }
    });

    useEffect(() => {
        if (user) {
            setProfile({
                storeName: user.storeName || '',
                name: user.name || '',
                email: user.email || '',
                businessType: user.businessType || '',
                pickupAddress: {
                    room: user.pickupAddress?.room || '',
                    street: user.pickupAddress?.street || '',
                    landmark: user.pickupAddress?.landmark || '',
                    pincode: user.pickupAddress?.pincode || '',
                    city: user.pickupAddress?.city || '',
                    state: user.pickupAddress?.state || ''
                }
            });
        }
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await api.put('/api/seller-onboard/profile', profile);
            await validateToken();
            setSuccess('Profile updated successfully!');
            toast.success('Settings saved');
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Failed to update profile';
            setError(msg);
            toast.error('Update failed: ' + msg);
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Loading Settings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-serif font-bold text-zinc-900">Settings</h1>
                <p className="text-zinc-500 mt-1">Manage your store details and logistics preferences.</p>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <p>{error}</p>
                </div>
            )}

            {success && (
                <div className="flex items-center gap-2 p-4 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <p>{success}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Store & Personal Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <Store className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold font-serif">Store Profile</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Store Name</label>
                                <div className="relative">
                                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input 
                                        type="text" 
                                        value={profile.storeName}
                                        onChange={e => setProfile({...profile, storeName: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-primary transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Business Type</label>
                                <select 
                                    value={profile.businessType}
                                    onChange={e => setProfile({...profile, businessType: e.target.value})}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-primary transition-all text-sm appearance-none"
                                >
                                    <option value="buy_sell">Buy & Sell</option>
                                    <option value="manufacture">Manufacturer</option>
                                    <option value="retail">Retailer</option>
                                    <option value="handicraft">Handicraft</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Contact Person</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input 
                                        type="text" 
                                        value={profile.name}
                                        onChange={e => setProfile({...profile, name: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-primary transition-all text-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Support Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <input 
                                        type="email" 
                                        value={profile.email}
                                        onChange={e => setProfile({...profile, email: e.target.value})}
                                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-primary transition-all text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pickup Address */}
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold font-serif">Pickup Address</h2>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 mb-6">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                            <p className="text-xs text-amber-800 leading-relaxed">
                                <strong>Important:</strong> Accurate pickup location is required for Shiprocket logistics. 
                                Changes here will affect where couriers arrive to collect your packages.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Building / Room No.</label>
                                <input 
                                    type="text" 
                                    value={profile.pickupAddress.room}
                                    onChange={e => setProfile({...profile, pickupAddress: {...profile.pickupAddress, room: e.target.value}})}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-primary transition-all text-sm"
                                    placeholder="e.g. Flat 402, 4th Floor"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Street / Locality</label>
                                <input 
                                    type="text" 
                                    value={profile.pickupAddress.street}
                                    onChange={e => setProfile({...profile, pickupAddress: {...profile.pickupAddress, street: e.target.value}})}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-primary transition-all text-sm"
                                    placeholder="e.g. Sunshine Apartments, Sector 12"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Landmark</label>
                                <input 
                                    type="text" 
                                    value={profile.pickupAddress.landmark}
                                    onChange={e => setProfile({...profile, pickupAddress: {...profile.pickupAddress, landmark: e.target.value}})}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-primary transition-all text-sm"
                                    placeholder="e.g. Opposite ICICI Bank"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Pincode</label>
                                    <input 
                                        type="text" 
                                        value={profile.pickupAddress.pincode}
                                        onChange={e => setProfile({...profile, pickupAddress: {...profile.pickupAddress, pincode: e.target.value}})}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-primary transition-all text-sm"
                                        placeholder="110001"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">City</label>
                                    <input 
                                        type="text" 
                                        value={profile.pickupAddress.city}
                                        onChange={e => setProfile({...profile, pickupAddress: {...profile.pickupAddress, city: e.target.value}})}
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-primary transition-all text-sm"
                                        placeholder="New Delhi"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">State</label>
                                <input 
                                    type="text" 
                                    value={profile.pickupAddress.state}
                                    onChange={e => setProfile({...profile, pickupAddress: {...profile.pickupAddress, state: e.target.value}})}
                                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-primary transition-all text-sm"
                                    placeholder="Delhi"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 text-white rounded-2xl p-6 md:p-8 shadow-xl">
                        <h3 className="text-lg font-bold font-serif mb-4">Save Changes</h3>
                        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                            Always keep your contact and pickup details up to date to ensure zero delays in order fulfillment and payout settlements.
                        </p>
                        <Button 
                            onClick={handleSave} 
                            disabled={saving}
                            className="w-full py-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-lg shadow-primary/20"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Settings'}
                        </Button>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-4" />
                        <h4 className="font-bold text-emerald-900">Shiprocket Sync</h4>
                        <p className="text-xs text-emerald-700 mt-2 leading-relaxed">
                            Your pickup address is automatically synced with Shiprocket whenever you fulfill an order.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
