'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { Loader2, Wallet, Banknote, History, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Payout {
    _id: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected';
    createdAt: string;
    failureReason?: string;
}

export default function SellerPayouts() {
    const { user, validateToken } = useAuth();
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Bank Form State
    const [accountNumber, setAccountNumber] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [beneficiaryName, setBeneficiaryName] = useState('');
    const [isLinking, setIsLinking] = useState(false);

    // Request Payout State
    const [amount, setAmount] = useState('');
    const [isRequesting, setIsRequesting] = useState(false);

    useEffect(() => {
        const fetchPayouts = async () => {
            try {
                // Refresh user data (balance) on mount
                await validateToken();
                
                const data = await api.get<Payout[]>('/api/payouts');
                setPayouts(data);
            } catch (err) {
                console.error("Failed to load payouts", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && user.role === 'seller') {
            fetchPayouts();
        }
    }, [user]);

    if (!user || user.role !== 'seller') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const handleLinkBank = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLinking(true);
        try {
            await api.post('/api/payouts/setup-account', {
                accountNumber,
                ifsc,
                beneficiaryName,
            });
            toast.success("Bank account linked successfully!");
            await validateToken(); // refresh user data to reflect linked account
        } catch (err: any) {
            toast.error(err.message || "Failed to link bank account");
        } finally {
            setIsLinking(false);
        }
    };

    const handleRequestPayout = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = Number(amount);
        if (numAmount < 100) {
            toast.error("Minimum payout is ₹100");
            return;
        }

        setIsRequesting(true);
        try {
            const data: any = await api.post('/api/payouts/request', { amount: numAmount });
            toast.success("Payout request submitted successfully!");
            setPayouts([data.payout, ...payouts]);
            setAmount('');
            await validateToken(); // Refresh balance in UI
        } catch (err: any) {
            toast.error(err.message || "Failed to request payout");
        } finally {
            setIsRequesting(false);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'completed': return <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
            case 'pending': return <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full"><Clock className="w-3.5 h-3.5" /> Pending</span>;
            case 'failed':
            case 'rejected': return <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full"><AlertCircle className="w-3.5 h-3.5" /> {status === 'failed' ? 'Failed' : 'Rejected'}</span>;
            default: return <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full"><Clock className="w-3.5 h-3.5 animate-pulse" /> Processing</span>;
        }
    };

    return (
        <div className="pb-20 space-y-10">
            <div>
                <h1 className="text-3xl font-serif font-bold text-zinc-900">Wallet & Payouts</h1>
                <p className="text-muted-foreground mt-2 font-medium">Manage your earnings, link accounts, and request withdrawals.</p>
            </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {/* Bank Linking Section */}
                    <div className="bg-background rounded-3xl p-8 border border-border shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary"><Banknote className="w-6 h-6" /></div>
                            <h2 className="text-xl font-bold font-serif text-foreground">Bank Details</h2>
                        </div>
                        
                        {(user as any).razorpayFundAccountId ? (
                            <div className="p-4 bg-green-50/50 border border-green-200 rounded-xl flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-green-900">Bank Account Linked</p>
                                    <p className="text-xs text-green-700/80 mt-1">Your payouts will be swept to your registered Razorpay fund account.</p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleLinkBank} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-foreground uppercase tracking-widest block mb-1">Beneficiary Name</label>
                                    <input type="text" required value={beneficiaryName} onChange={e => setBeneficiaryName(e.target.value)} className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="As per bank records" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-foreground uppercase tracking-widest block mb-1">Account Number</label>
                                    <input type="password" required value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="Enter Account Number" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-foreground uppercase tracking-widest block mb-1">IFSC Code</label>
                                    <input type="text" required value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="e.g. HDFC0001234" />
                                </div>
                                <Button type="submit" className="w-full h-12 rounded-xl text-md font-bold" disabled={isLinking}>
                                    {isLinking ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Link Bank Account'}
                                </Button>
                            </form>
                        )}
                    </div>

                    {/* Request Payout Section */}
                    <div className="bg-background rounded-3xl p-8 border border-border shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-primary/10 rounded-xl text-primary"><Wallet className="w-6 h-6" /></div>
                            <h2 className="text-xl font-bold font-serif text-foreground">Withdraw Funds</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                            <div className="p-5 bg-amber-50/50 border border-amber-200 rounded-2xl">
                                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    Pending Balance <Clock className="w-3 h-3" />
                                </p>
                                <p className="text-2xl font-black text-amber-900">₹{(user as any).pendingBalance?.toLocaleString() || '0.00'}</p>
                            </div>
                            <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl">
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 flex items-center gap-1">
                                    Available Balance <CheckCircle2 className="w-3 h-3" />
                                </p>
                                <p className="text-2xl font-black text-foreground">₹{(user as any).sellerBalance?.toLocaleString() || '0.00'}</p>
                            </div>
                        </div>

                        <div className="mb-6 p-4 bg-muted/30 border border-border rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <p className="text-[11px] leading-relaxed text-muted-foreground">
                                <b>Note:</b> Pending funds are held for a <b>7-day return period</b> after delivery. Once the window closes, they automatically move to your Available Balance for withdrawal.
                            </p>
                        </div>

                        <form onSubmit={handleRequestPayout} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-foreground uppercase tracking-widest block mb-1">Amount to Withdraw</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                                    <input type="number" min="100" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full pl-8 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:outline-none transition-all text-lg font-bold" placeholder="1000" disabled={!(user as any).razorpayFundAccountId} />
                                </div>
                                {!(user as any).razorpayFundAccountId && (
                                    <p className="text-[10px] text-rose-500 font-medium mt-1">Please link your bank account first.</p>
                                )}
                            </div>
                            <Button type="submit" className="w-full h-12 rounded-xl text-md font-bold" disabled={isRequesting || !(user as any).razorpayFundAccountId}>
                                {isRequesting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Request Payout'}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Payout History */}
                <div className="bg-background rounded-3xl p-8 border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary"><History className="w-6 h-6" /></div>
                        <h2 className="text-xl font-bold font-serif text-foreground">Transaction History</h2>
                    </div>

                    {isLoading ? (
                        <div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                    ) : payouts.length === 0 ? (
                        <div className="py-10 text-center text-muted-foreground font-medium flex flex-col items-center gap-3">
                            <History className="w-8 h-8 opacity-20" />
                            No payout requests yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border/60">
                                        <th className="py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                                        <th className="py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount</th>
                                        <th className="py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                                        <th className="py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payouts.map(p => (
                                        <tr key={p._id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                                            <td className="py-4 px-4 text-sm font-medium text-foreground">{new Date(p.createdAt).toLocaleDateString()}</td>
                                            <td className="py-4 px-4 text-sm font-black text-foreground">₹{p.amount.toLocaleString()}</td>
                                            <td className="py-4 px-4"><StatusBadge status={p.status} /></td>
                                            <td className="py-4 px-4 text-xs text-muted-foreground">{p.failureReason || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
        </div>
    );
}
