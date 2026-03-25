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

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (user.role !== 'seller') {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                <h1 className="text-2xl font-bold font-serif text-foreground mb-4">Access Denied</h1>
                <p className="text-muted-foreground mb-8">This dashboard is strictly for verified Aura Creators.</p>
                <Button asChild><Link href="/">Return to Explore</Link></Button>
            </div>
        );
    }

    if (isLoading || !data) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 border-t border-border mt-20">
                <Navbar />
                <div className="flex-1 flex items-center justify-center w-full">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
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
        <div className="min-h-screen bg-muted/20 pb-20">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 mt-8 md:mt-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-foreground">Seller Dashboard</h1>
                        <p className="text-muted-foreground mt-2">Welcome back, {user.storeName || user.name}. Manage your products and track performance.</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                        <Button asChild className="flex-1 md:flex-none rounded-full">
                            <Link href="/seller/products/new"><Plus className="w-4 h-4 mr-2" /> Add New Product</Link>
                        </Button>
                    </div>
                </div>

                {/* Stat Cards - The 10,000 ft view */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                    <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
                        <div className="flex items-center gap-3 text-muted-foreground mb-3">
                            <div className="p-2 bg-primary/10 rounded-lg"><ImageIcon className="w-5 h-5 text-primary" /></div>
                            <span className="font-medium">Total Products</span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">{overview.totalProducts.toLocaleString()}</p>
                    </div>

                    <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
                        <div className="flex items-center gap-3 text-muted-foreground mb-3">
                            <div className="p-2 bg-primary/10 rounded-lg"><LayoutGrid className="w-5 h-5 text-primary" /></div>
                            <span className="font-medium">Total Looks</span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">{overview.totalPublished.toLocaleString()}</p>
                    </div>

                    <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
                        <div className="flex items-center gap-3 text-muted-foreground mb-3">
                            <div className="p-2 bg-primary/10 rounded-lg"><Eye className="w-5 h-5 text-primary" /></div>
                            <span className="font-medium">Total Views</span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">{overview.totalViews.toLocaleString()}</p>
                    </div>

                    <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
                        <div className="flex items-center gap-3 text-muted-foreground mb-3">
                            <div className="p-2 bg-primary/10 rounded-lg"><Bookmark className="w-5 h-5 text-primary" /></div>
                            <span className="font-medium">Total Saves</span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">{overview.totalSaves.toLocaleString()}</p>
                    </div>

                    <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
                        <div className="flex items-center gap-3 text-muted-foreground mb-3">
                            <div className="p-2 bg-primary/10 rounded-lg"><TrendingUp className="w-5 h-5 text-primary" /></div>
                            <span className="font-medium">Conversion Rate</span>
                        </div>
                        <p className="text-3xl font-bold text-foreground">{engagementRate}%</p>
                    </div>
                </div>

                {/* Quick Management */}
                <div className="mb-12">
                    <Link href="/seller/products" className="group block bg-background rounded-3xl p-8 border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all mb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-secondary rounded-2xl group-hover:bg-primary/10 transition-colors">
                                    <ImageIcon className="w-8 h-8 text-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold font-serif text-foreground">Manage Inventory</h2>
                                    <p className="text-muted-foreground">Edit details, update stock, or remove products from your catalog.</p>
                                </div>
                            </div>
                            <Button className="rounded-full px-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                View Products
                            </Button>
                        </div>
                    </Link>

                    <Link href="/seller/payouts" className="group block bg-background rounded-3xl p-8 border border-border shadow-sm hover:border-primary/50 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="p-4 bg-secondary rounded-2xl group-hover:bg-primary/10 transition-colors">
                                    <TrendingUp className="w-8 h-8 text-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-bold font-serif text-foreground">Wallet & Payouts</h2>
                                    <p className="text-muted-foreground">Link your bank account, track earnings, and request withdrawals via Razorpay.</p>
                                </div>
                            </div>
                            <Button className="rounded-full px-6 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                View Payouts
                            </Button>
                        </div>
                    </Link>
                </div>

            </main>
        </div>
    );
}
