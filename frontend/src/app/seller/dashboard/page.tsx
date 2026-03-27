'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, TrendingUp, Users, Bookmark, Eye, Image as ImageIcon, Plus, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface AnalyticsData {
    overview: {
        totalPublished: number; // Looks
        totalProducts: number; // Products
        totalViews: number;
        totalSaves: number;
        followerCount: number;
    };
}

export default function SellerDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'seller') {
            setIsLoading(false);
            return;
        }

        const fetchAnalytics = async () => {
            try {
                const res = await api.get<AnalyticsData>('/api/analytics/overview');
                setData(res);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, [user]);

    if (!user || user.role !== 'seller') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
                <h1 className="text-2xl font-serif font-black text-zinc-900 mb-2">Access Restricted</h1>
                <p className="text-sm text-zinc-500 max-w-xs mb-8">This dashboard is only available to registered Aura Suppliers.</p>
                <Button asChild className="rounded-xl px-8 h-12 font-bold"><Link href="/">Return Home</Link></Button>
            </div>
        );
    }

    if (isLoading || !data) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary/30" />
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Loading Hub Data...</p>
                </div>
            </div>
        );
    }

    const { overview } = data;

    // Calculate global engagement rate safe against division by 0
    const engagementRate = overview.totalViews > 0
        ? ((overview.totalSaves / overview.totalViews) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="pb-20 space-y-10">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-black text-zinc-900 tracking-tight leading-none mb-2">Business Overview</h1>
                    <p className="text-sm text-zinc-500 font-medium">Welcome back, <span className="text-zinc-900 font-bold">{user.storeName || user.name}</span>. Here's how your store is performing today.</p>
                </div>
                <div className="flex gap-4">
                    <Button asChild variant="outline" className="rounded-xl h-11 px-6 font-bold text-xs border-zinc-200">
                        <Link href="/seller/payouts">View Wallet</Link>
                    </Button>
                    <Button asChild className="rounded-xl h-11 px-6 font-bold text-xs shadow-lg shadow-primary/20">
                        <Link href="/seller/products/new"><Plus className="w-4 h-4 mr-2" /> Add Product</Link>
                    </Button>
                </div>
            </div>

            {/* Main Stats Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-3 text-zinc-400 mb-6 group-hover:text-primary transition-colors">
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Inventory</span>
                    </div>
                    <p className="text-4xl font-black text-zinc-900 tracking-tighter mb-1">{overview.totalProducts.toLocaleString()}</p>
                    <p className="text-xs text-zinc-500 font-medium">Live Products</p>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-3 text-zinc-400 mb-6 group-hover:text-primary transition-colors">
                        <Eye className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Impressions</span>
                    </div>
                    <p className="text-4xl font-black text-zinc-900 tracking-tighter mb-1">{overview.totalViews.toLocaleString()}</p>
                    <p className="text-xs text-zinc-500 font-medium">Total Page Views</p>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-3 text-zinc-400 mb-6 group-hover:text-primary transition-colors">
                        <Bookmark className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Interest</span>
                    </div>
                    <p className="text-4xl font-black text-zinc-900 tracking-tighter mb-1">{overview.totalSaves.toLocaleString()}</p>
                    <p className="text-xs text-zinc-500 font-medium">Customer Saves</p>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-center gap-3 text-zinc-400 mb-6 group-hover:text-primary transition-colors">
                        <TrendingUp className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Performance</span>
                    </div>
                    <p className="text-4xl font-black text-zinc-900 tracking-tighter mb-1">{engagementRate}%</p>
                    <p className="text-xs text-zinc-500 font-medium">Engagement Rate</p>
                </div>
            </div>

            {/* Financial Quick View & Operations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Quick Access Tiles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Link href="/seller/orders" className="group p-8 bg-zinc-900 rounded-[2.5rem] text-white overflow-hidden relative border border-white/5 transition-all hover:scale-[1.02] hover:bg-black">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-serif font-black mb-1">Orders</h3>
                                <p className="text-zinc-500 text-xs font-medium">Track and ship customer purchases</p>
                            </div>
                            <Plus className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 group-hover:text-primary/10 transition-colors rotate-12" />
                        </Link>
                        
                        <Link href="/seller/payouts" className="group p-8 bg-white rounded-[2.5rem] border border-zinc-100 overflow-hidden relative transition-all hover:scale-[1.02] hover:border-zinc-300">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-serif font-black text-zinc-900 mb-1">Earnings</h3>
                                <p className="text-zinc-400 text-xs font-medium">Manage your bank and withdrawals</p>
                            </div>
                            <TrendingUp className="absolute -bottom-4 -right-4 w-32 h-32 text-zinc-50 group-hover:text-primary/10 transition-colors -rotate-12" />
                        </Link>
                    </div>

                    {/* Operational Alert (Professional Touch) */}
                    <div className="p-8 bg-primary/5 border border-primary/10 rounded-[2.5rem] relative overflow-hidden">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-lg font-serif font-black text-primary mb-1">Next Day Dispatch</h3>
                                <p className="text-xs text-zinc-600 font-medium max-w-sm">Upcoming Policy: Standardize your shipping to 24-hours to boost visibility and gain the "Fast Ship" badge.</p>
                            </div>
                            <Button className="rounded-xl h-10 px-6 font-bold text-xs">Learn More</Button>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 blur-3xl rounded-full" />
                    </div>
                </div>

                {/* Sidebar Cards (Dashboard Right) */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-100 shadow-sm">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6 border-b border-zinc-50 pb-4">Wallet Balance</h4>
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight mb-1">Available</p>
                                <p className="text-3xl font-black text-zinc-900 tracking-tighter">₹{(user as any).sellerBalance?.toLocaleString() || '0.00'}</p>
                            </div>
                            <div className="pt-6 border-t border-zinc-50">
                                <p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-tight mb-1">Pending (Locked)</p>
                                <p className="text-xl font-black text-amber-600 tracking-tight">₹{(user as any).pendingBalance?.toLocaleString() || '0.00'}</p>
                            </div>
                            <Button asChild variant="link" className="p-0 h-auto text-primary font-bold text-xs">
                                <Link href="/seller/payouts">View Details &rarr;</Link>
                            </Button>
                        </div>
                    </div>

                    <div className="bg-zinc-50 rounded-[2.5rem] p-8 border border-zinc-100">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Support</h4>
                        <p className="text-xs text-zinc-600 font-medium leading-relaxed mb-6">Need help with orders or technical issues? Our partner support is live 24/7.</p>
                        <Button variant="outline" className="w-full rounded-xl h-10 font-bold text-xs bg-white border-zinc-200">Contact Support</Button>
                    </div>
                </div>
            </div>

        </div>
    );
}
