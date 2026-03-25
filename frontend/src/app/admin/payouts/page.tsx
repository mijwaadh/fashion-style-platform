'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Loader2, DollarSign, CheckCircle2, AlertCircle, Clock, LayoutGrid, Users, ShoppingBag, Package, Shield, BarChart2, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Payout {
    _id: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'rejected';
    createdAt: string;
    failureReason?: string;
    sellerId: {
        _id: string;
        name: string;
        storeName: string;
        email: string;
    };
}

const navItems = [
    { icon: LayoutGrid, label: 'Overview', href: '/admin/dashboard' },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: ShoppingBag, label: 'Sellers', href: '/admin/sellers' },
    { icon: Package, label: 'Products', href: '/admin/products' },
    { icon: Package, label: 'Looks', href: '/admin/looks' },
    { icon: DollarSign, label: 'Payouts', href: '/admin/payouts', active: true },
    { icon: Shield, label: 'Moderation', href: '/admin/moderation' },
    { icon: BarChart2, label: 'Analytics', href: '/admin/analytics' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminPayouts() {
    const { user, logout } = useAuth();
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchPayouts = async () => {
            try {
                const data = await api.get<Payout[]>('/api/payouts/all');
                setPayouts(data);
            } catch (err) {
                console.error("Failed to load payouts", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (user && user.role === 'admin') {
            fetchPayouts();
        }
    }, [user]);

    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center border-t border-border mt-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const handleProcessPayout = async (id: string) => {
        setProcessingId(id);
        try {
            const data: any = await api.post(`/api/payouts/process/${id}`, {});
            toast.success("Payout processed successfully via Razorpay!");
            setPayouts(payouts.map(p => p._id === id ? { ...p, status: 'completed' } : p));
        } catch (err: any) {
            toast.error(err.message || "Failed to process payout");
            // Refresh to get failure reason
            const updated = await api.get<Payout[]>('/api/payouts/all');
            setPayouts(updated);
        } finally {
            setProcessingId(null);
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
        <div className="min-h-screen flex bg-muted/30">
            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-background border-r border-border px-4 py-8 shrink-0">
                <Link href="/" className="font-serif text-2xl font-bold text-foreground mb-2 px-2">Aura.</Link>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-8 px-2">Admin Control</p>

                <nav className="flex flex-col gap-1 flex-1">
                    {navItems.map(({ icon: Icon, label, href, active }) => (
                        <Link key={label} href={href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all-smooth ${active
                                ? 'bg-foreground text-background shadow-sm'
                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="border-t border-border pt-4 mt-4">
                    <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all-smooth w-full">
                        <LogOut className="w-4 h-4" />Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-foreground">Manage Payouts</h1>
                        <p className="text-muted-foreground mt-1">Review pending withdrawal requests and process them via RazorpayX.</p>
                    </div>

                    <div className="bg-background rounded-3xl p-8 border border-border shadow-sm">
                        {isLoading ? (
                            <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
                        ) : payouts.length === 0 ? (
                            <div className="py-20 text-center text-muted-foreground font-medium flex flex-col items-center gap-3">
                                <DollarSign className="w-10 h-10 opacity-20" />
                                No payouts found.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="border-b border-border/60">
                                            <th className="py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Requested</th>
                                            <th className="py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Seller / Store</th>
                                            <th className="py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</th>
                                            <th className="py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount</th>
                                            <th className="py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                                            <th className="py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payouts.map(p => (
                                            <tr key={p._id} className="border-b border-border/40 hover:bg-muted/10 transition-colors">
                                                <td className="py-4 px-4 text-sm font-medium text-foreground">{new Date(p.createdAt).toLocaleDateString()}</td>
                                                <td className="py-4 px-4 font-semibold text-foreground">
                                                    {p.sellerId?.storeName || p.sellerId?.name || 'Unknown'}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-muted-foreground">{p.sellerId?.email}</td>
                                                <td className="py-4 px-4 text-sm font-black text-foreground">₹{p.amount.toLocaleString()}</td>
                                                <td className="py-4 px-4">
                                                    <div className="flex flex-col gap-1 items-start">
                                                        <StatusBadge status={p.status} />
                                                        {p.failureReason && (
                                                            <span className="text-[10px] text-rose-500 max-w-[150px] truncate" title={p.failureReason}>
                                                                {p.failureReason}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    {p.status === 'pending' || p.status === 'failed' ? (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleProcessPayout(p._id)}
                                                            disabled={processingId === p._id}
                                                            className="rounded-full font-bold text-xs"
                                                        >
                                                            {processingId === p._id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : 'Process Transfer'}
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs font-bold text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
