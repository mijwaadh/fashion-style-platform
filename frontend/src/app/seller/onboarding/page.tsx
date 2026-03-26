'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Landmark, Store, CheckCircle2, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

const steps = [
    { id: 1, title: 'Business Details', icon: Building2 },
    { id: 2, title: 'Pickup Address', icon: MapPin },
    { id: 3, title: 'Bank Details', icon: Landmark },
    { id: 4, title: 'Supplier Details', icon: Store },
];

export default function SellerOnboardingPage() {
    const router = useRouter();
    const { user, validateToken } = useAuth();
    
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [hasGst, setHasGst] = useState<boolean>(true);
    const [gstin, setGstin] = useState('');
    const [enrollmentId, setEnrollmentId] = useState('');
    const [taxVerified, setTaxVerified] = useState(false);

    const [address, setAddress] = useState({
        room: '', street: '', landmark: '', pincode: '', city: '', state: ''
    });

    const [bank, setBank] = useState({
        accountNumber: '', ifsc: '', beneficiaryName: ''
    });

    const [supplier, setSupplier] = useState({
        storeName: user?.storeName || '',
        name: user?.name || '',
        email: user?.email || '',
        businessType: '',
        agreed: false
    });

    const handleVerifyTax = async () => {
        const taxId = hasGst ? gstin : enrollmentId;
        if (!taxId) {
            setError(hasGst ? 'Please enter GSTIN' : 'Please enter Enrollment ID');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/api/seller-onboard/verify-tax', {
                taxType: hasGst ? 'GSTIN' : 'ENROLLMENT_ID',
                taxId
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((res as any).verified) {
                setTaxVerified(true);
            }
        } catch (err: any) {
            setError(err.message || 'Verification failed. Please check your ID.');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalSubmit = async () => {
        if (!supplier.agreed) {
            setError('You must agree to the Supplier Agreement');
            return;
        }
        setLoading(true);
        setError('');
        try {
            // First submit the bank details to payouts API
            const bankRes = await api.post('/api/payouts/setup-account', bank);
            // Ignore error locally if payouts setup succeeds conceptually

            // Complete the main onboarding flow
            const payload = {
                taxType: hasGst ? 'GSTIN' : 'ENROLLMENT_ID',
                taxId: hasGst ? gstin : enrollmentId,
                pickupAddress: address,
                businessType: supplier.businessType,
                agreedToSupplierTerms: supplier.agreed,
                storeName: supplier.storeName,
                name: supplier.name,
                email: supplier.email
            };

            await api.post('/api/seller-onboard/complete', payload);
            
            // Re-validate token so local context picks up onboardingCompleted flag
            await validateToken();

            router.push('/seller/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to complete onboarding');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null; // Wait for AuthContext to boot
    if (user.role !== 'seller') {
        router.push('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-muted/20">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row gap-8">
                
                {/* Left Sidebar Steps */}
                <div className="w-full md:w-64 shrink-0">
                    <h1 className="font-serif text-2xl font-bold mb-6 text-foreground">Complete Profile</h1>
                    <div className="space-y-2">
                        {steps.map((step) => {
                            const Icon = step.icon;
                            const isActive = step.id === currentStep;
                            const isPast = step.id < currentStep;
                            return (
                                <div key={step.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-muted-foreground'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-primary bg-primary/20' : isPast ? 'border-green-500 bg-green-500 text-white' : 'border-border bg-background'}`}>
                                        {isPast ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                                    </div>
                                    <span className="text-sm">{step.title}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 bg-background rounded-2xl border border-border shadow-sm p-6 md:p-8">
                    
                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 mb-6 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-xl font-bold font-serif text-foreground">Business Details</h2>
                            <p className="text-sm text-muted-foreground">Do you have a GST number?</p>
                            
                            <div className="flex gap-4 mb-6">
                                <label className={`flex-1 border p-4 rounded-xl cursor-pointer flex gap-3 transition-colors ${hasGst ? 'border-primary bg-primary/5' : 'border-border'}`}>
                                    <input type="radio" checked={hasGst} onChange={() => setHasGst(true)} className="mt-1" />
                                    <div>
                                        <p className="font-semibold text-foreground text-sm">Yes, I have GST</p>
                                        <p className="text-xs text-muted-foreground">Enter GSTIN and sell anywhere</p>
                                    </div>
                                </label>
                                <label className={`flex-1 border p-4 rounded-xl cursor-pointer flex gap-3 transition-colors ${!hasGst ? 'border-primary bg-primary/5' : 'border-border'}`}>
                                    <input type="radio" checked={!hasGst} onChange={() => setHasGst(false)} className="mt-1" />
                                    <div>
                                        <p className="font-semibold text-foreground text-sm">No, I don't have GST</p>
                                        <p className="text-xs text-muted-foreground">Sell with an Enrolment ID</p>
                                    </div>
                                </label>
                            </div>

                            {hasGst ? (
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold">Enter GSTIN</label>
                                    <div className="flex gap-3">
                                        <input type="text" value={gstin} onChange={e => setGstin(e.target.value.toUpperCase())} maxLength={15} 
                                            className="flex-1 px-4 py-3 rounded-lg border border-border bg-muted/30 focus:outline-primary placeholder-muted-foreground text-foreground"
                                            placeholder="22AAAAA0000A1Z5" disabled={taxVerified} />
                                        {!taxVerified && (
                                            <Button onClick={handleVerifyTax} disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}</Button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-muted p-4 rounded-xl border border-border text-sm text-foreground">
                                        <p>Non-GST sellers must obtain an Enrolment ID/UIN from the GST website.</p>
                                        <Link href="https://reg.gst.gov.in/registration/generateuid" target="_blank" className="text-primary hover:underline font-semibold mt-2 inline-block">
                                            Get EID in mins ⚡
                                        </Link>
                                    </div>
                                    <label className="text-sm font-semibold block">Enter Enrolment ID / UIN</label>
                                    <div className="flex gap-3">
                                        <input type="text" value={enrollmentId} onChange={e => setEnrollmentId(e.target.value.toUpperCase())} 
                                            className="flex-1 px-4 py-3 rounded-lg border border-border bg-muted/30 focus:outline-primary placeholder-muted-foreground text-foreground"
                                            placeholder="032600039941ESE" disabled={taxVerified} />
                                        {!taxVerified && (
                                            <Button onClick={handleVerifyTax} disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}</Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {taxVerified && (
                                <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" /> 
                                    <span className="font-semibold">Successfully Verified!</span>
                                </div>
                            )}

                            <Button 
                                onClick={() => setCurrentStep(2)} 
                                disabled={!taxVerified}
                                className="w-full py-6 mt-8"
                            >
                                Continue <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-xl font-bold font-serif text-foreground">Pickup Address</h2>
                            <p className="text-sm text-muted-foreground bg-amber-50 text-amber-800 p-3 rounded-lg border border-amber-200">
                                Products will be picked up from this location for delivery.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-muted-foreground font-semibold uppercase">Room/ Floor/ Building Number</label>
                                    <input type="text" value={address.room} onChange={e => setAddress({...address, room: e.target.value})} className="w-full mt-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground font-semibold uppercase">Street / Locality</label>
                                    <input type="text" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="w-full mt-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground font-semibold uppercase">Landmark</label>
                                    <input type="text" value={address.landmark} onChange={e => setAddress({...address, landmark: e.target.value})} className="w-full mt-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-primary" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-muted-foreground font-semibold uppercase">Pincode</label>
                                        <input type="text" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} className="w-full mt-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-primary" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-muted-foreground font-semibold uppercase">City</label>
                                        <input type="text" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full mt-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-primary" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground font-semibold uppercase">State</label>
                                    <input type="text" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="w-full mt-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-primary" />
                                </div>
                            </div>

                            <Button onClick={() => setCurrentStep(3)} disabled={!address.room || !address.street || !address.pincode || !address.city || !address.state} className="w-full py-6 mt-8">
                                Continue <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-xl font-bold font-serif text-foreground">Bank Details</h2>
                            <p className="text-sm text-muted-foreground mb-4">Link your bank account to receive automated payout sweeps securely.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-muted-foreground font-semibold uppercase">Account Number</label>
                                    <input type="text" value={bank.accountNumber} onChange={e => setBank({...bank, accountNumber: e.target.value})} className="w-full mt-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground font-semibold uppercase">IFSC Code</label>
                                    <input type="text" value={bank.ifsc} onChange={e => setBank({...bank, ifsc: e.target.value.toUpperCase()})} className="w-full mt-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-primary text-uppercase" placeholder="HDFC0001234" />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground font-semibold uppercase">Beneficiary Name</label>
                                    <input type="text" value={bank.beneficiaryName} onChange={e => setBank({...bank, beneficiaryName: e.target.value})} className="w-full mt-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-primary" />
                                    <p className="text-xs text-muted-foreground mt-1 text-right">Must match the registered bank account name.</p>
                                </div>
                            </div>

                            <Button onClick={() => setCurrentStep(4)} disabled={!bank.accountNumber || !bank.ifsc || !bank.beneficiaryName} className="w-full py-6 mt-8">
                                Continue <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <h2 className="text-xl font-bold font-serif text-foreground">Supplier Details</h2>
                            <p className="text-sm bg-primary/10 text-primary p-3 rounded-lg border border-primary/20">
                                Your store name will be visible to all buyers on Aura.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-muted-foreground font-semibold uppercase">Store Name</label>
                                    <input type="text" value={supplier.storeName} onChange={e => setSupplier({...supplier, storeName: e.target.value})} className="w-full mt-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground font-semibold uppercase">Your Full Name</label>
                                    <input type="text" value={supplier.name} onChange={e => setSupplier({...supplier, name: e.target.value})} className="w-full mt-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-primary" />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground font-semibold uppercase">Email ID</label>
                                    <input type="email" value={supplier.email} onChange={e => setSupplier({...supplier, email: e.target.value})} className="w-full mt-1 px-4 py-3 rounded-lg border border-border bg-background focus:outline-primary" />
                                </div>

                                <div>
                                    <label className="text-xs text-muted-foreground font-semibold uppercase block mb-1">What's your business type?</label>
                                    <select value={supplier.businessType} onChange={e => setSupplier({...supplier, businessType: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-primary">
                                        <option value="">Select an option</option>
                                        <option value="buy_sell">I buy from other sellers and sell online</option>
                                        <option value="manufacture">I have a manufacturing unit</option>
                                        <option value="retail">I have a retail shop</option>
                                        <option value="handicraft">I make handcrafted products at home</option>
                                    </select>
                                </div>

                                <label className="flex items-start gap-3 mt-4 border border-border p-4 rounded-xl hover:bg-muted/30 cursor-pointer">
                                    <input type="checkbox" checked={supplier.agreed} onChange={e => setSupplier({...supplier, agreed: e.target.checked})} className="mt-1" />
                                    <span className="text-sm text-foreground font-medium">I agree to comply with Aura's Supplier Agreement and Platform Policies.</span>
                                </label>
                            </div>

                            <Button onClick={handleFinalSubmit} disabled={!supplier.storeName || !supplier.businessType || !supplier.agreed || loading} className="w-full py-6 mt-8">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Registration'}
                            </Button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
