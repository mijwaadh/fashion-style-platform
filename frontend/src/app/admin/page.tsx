'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import AdminGuard from '@/components/layout/AdminGuard';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
    Users, Image as ImageIcon, ShoppingBag, Bookmark,
    Loader2, BarChart2, UserCheck, UserCog, ChevronRight,
    MessageSquare, Bell, ShieldAlert, DollarSign
} from 'lucide-react';


interface PlatformStats {
    totalUsers: number;
    totalLooks: number;
    totalProducts: number;
    totalSaves: number;
    usersByRole: { _id: string; count: number }[];
    recentLooks: { _id: string; count: number }[];
}

function StatCard({ icon: Icon, label, value, color }: {
    icon: React.ElementType;
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-muted-foreground">{label}</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{value.toLocaleString()}</p>
        </div>
    );
}

function AdminOverviewContent() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { logout } = useAuth();
    const router = useRouter();

    const fetchStats = useCallback(async () => {
        try {
            setError(null);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data: PlatformStats = await api.get<PlatformStats>('/api/admin/stats');
            setStats(data);
        } catch (err: any) {
            console.error('Failed to load admin stats:', err);
            if (err.message?.includes('Not authorized') || err.message?.includes('Token is invalid')) {
                setError('Your admin session has expired. Redirecting to login...');
                setTimeout(() => {
                    logout();
                    router.push('/auth/login?redirect=/admin');
                }, 2000);
            } else {
                setError('Failed to load admin statistics. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [logout]);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const maxCount = stats?.recentLooks.length
        ? Math.max(...stats.recentLooks.map(d => d.count))
        : 1;

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 mt-8 md:mt-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                            <span className="font-medium text-primary">Admin</span>
                        </div>
                        <h1 className="font-serif text-3xl font-bold text-foreground">Platform Overview</h1>
                        <p className="text-muted-foreground mt-1">
                            Real-time snapshot of all platform activity.
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="text-destructive mb-4">
                            <ShieldAlert className="w-16 h-16 mx-auto" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Access Error</h2>
                        <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
                        <div className="flex gap-3">
                            {error?.includes('Redirecting') ? (
                                <div className="text-sm text-muted-foreground">Redirecting...</div>
                            ) : (
                                <>
                                    <Button onClick={fetchStats} variant="outline">
                                        Try Again
                                    </Button>
                                    <Button onClick={logout} variant="default">
                                        Log In Again
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                ) : stats ? (
                    <div className="space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            <StatCard icon={Users} label="Total Users" value={stats.totalUsers} color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
                            <StatCard icon={ImageIcon} label="Total Looks" value={stats.totalLooks} color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
                            <StatCard icon={ShoppingBag} label="Products" value={stats.totalProducts} color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
                            <StatCard icon={Bookmark} label="Total Saves" value={stats.totalSaves} color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Recent Activity Chart */}
                            <div className="lg:col-span-2 bg-background rounded-2xl p-6 border border-border shadow-sm">
                                <div className="flex items-center gap-2 mb-6">
                                    <BarChart2 className="w-5 h-5 text-primary" />
                                    <h2 className="font-bold text-foreground">Looks Published — Last 7 Days</h2>
                                </div>
                                {stats.recentLooks.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground text-sm">No look data available for this period.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {stats.recentLooks.map(day => (
                                            <div key={day._id} className="flex items-center gap-3">
                                                <span className="text-xs text-muted-foreground w-24 shrink-0 font-medium">{day._id}</span>
                                                <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary/80 rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                                                        style={{ width: `${(day.count / maxCount) * 100}%`, minWidth: '2rem' }}
                                                    >
                                                        <span className="text-[10px] font-bold text-primary-foreground">{day.count}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Users by Role */}
                            <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
                                <div className="flex items-center gap-2 mb-6">
                                    <UserCog className="w-5 h-5 text-primary" />
                                    <h2 className="font-bold text-foreground">Users by Role</h2>
                                </div>
                                <div className="space-y-4">
                                    {stats.usersByRole.map(r => (
                                        <div key={r._id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <UserCheck className="w-4 h-4 text-muted-foreground" />
                                                <span className="capitalize font-medium text-foreground">{r._id}</span>
                                            </div>
                                            <span className="text-sm font-bold px-3 py-1 bg-muted rounded-full text-foreground">{r.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Quick Navigation */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { href: '/admin/users', label: 'Manage Users', desc: 'Change roles, delete accounts', icon: Users },
                                { href: '/admin/looks', label: 'Moderate Looks', desc: 'Edit title/image or remove', icon: ImageIcon },
                                { href: '/admin/products', label: 'Manage Products', desc: 'Edit info or delete listings', icon: ShoppingBag },
                                { href: '/admin/comments', label: 'Moderate Comments', desc: 'Remove spam or toxic replies', icon: MessageSquare },
                                { href: '/admin/payouts', label: 'Manage Payouts', desc: 'Process seller withdrawal requests', icon: DollarSign },
                                { href: '/admin/broadcast', label: 'Broadcast Notifications', desc: 'Send system-wide alerts', icon: Bell },
                            ].map(item => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="group flex items-center justify-between p-5 bg-background rounded-2xl border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary/10 rounded-xl">
                                            <item.icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-20">Failed to load stats.</p>
                )}
            </main>
        </div>
    );
}

export default function AdminPage() {
    return (
        <AdminGuard>
            <AdminOverviewContent />
        </AdminGuard>
    );
}
