'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
    ChevronLeft, 
    BarChart3, 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    ShoppingBag, 
    Users, 
    Loader2, 
    Calendar,
    ArrowUpRight,
    PieChart as PieChartIcon
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Cell, PieChart, Pie, Legend 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import AdminGuard from '@/components/layout/AdminGuard';
import Navbar from '@/components/layout/Navbar';

interface AnalyticsData {
    summary: {
        totalRevenue: number;
        totalOrders: number;
        totalUsers: number;
        periodRevenue: number;
        periodOrders: number;
        aov: number;
    };
    charts: {
        sales: { _id: string; revenue: number; orders: number }[];
        users: { _id: string; count: number }[];
        categories: { _id: string; value: number }[];
    };
    topProducts: {
        _id: string;
        name: string;
        imageUrl: string;
        totalRevenue: number;
        totalSold: number;
    }[];
}

const COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

function AnalyticsContent() {
    const [timeframe, setTimeframe] = useState('30d');
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const result = await api.get<AnalyticsData>(`/api/admin/analytics?timeframe=${timeframe}`);
            setData(result);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
        } finally {
            setLoading(false);
        }
    }, [timeframe]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (loading && !data) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium animate-pulse uppercase tracking-widest text-xs">Generating Reports...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            <Navbar />
            
            <main className="max-w-7xl mx-auto px-4 mt-8 md:mt-12 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Button variant="ghost" size="icon" asChild className="rounded-full">
                                <Link href="/admin"><ChevronLeft className="w-5 h-5" /></Link>
                            </Button>
                            <div className="text-sm text-muted-foreground">
                                <Link href="/admin" className="text-primary font-medium hover:underline">Admin Panel</Link>
                                <span className="mx-1">›</span> Analytics
                            </div>
                        </div>
                        <h1 className="font-serif text-4xl font-bold text-foreground">Performance Dashboard</h1>
                        <p className="text-muted-foreground mt-2">In-depth analysis of platform growth and revenue.</p>
                    </div>

                    <div className="flex items-center bg-background p-1 rounded-2xl border border-border shadow-sm">
                        {['7d', '30d', '90d', '1y'].map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                    timeframe === tf 
                                    ? 'bg-foreground text-background shadow-md' 
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted font-black'
                                }`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>

                {data && (
                    <div className="space-y-8">
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <KPICard 
                                title="Net Revenue" 
                                value={`₹${data.summary.periodRevenue.toLocaleString('en-IN')}`} 
                                icon={DollarSign}
                                trend="+12.5%" 
                                subtext={`Total: ₹${data.summary.totalRevenue.toLocaleString('en-IN')}`}
                                color="bg-emerald-500"
                            />
                            <KPICard 
                                title="Orders" 
                                value={data.summary.periodOrders.toString()} 
                                icon={ShoppingBag}
                                trend="+8.2%" 
                                subtext={`Total: ${data.summary.totalOrders}`}
                                color="bg-violet-500"
                            />
                            <KPICard 
                                title="Avg. Order Value" 
                                value={`₹${data.summary.aov.toLocaleString('en-IN')}`} 
                                icon={TrendingUp}
                                trend="+4.1%" 
                                subtext="Across all paid orders"
                                color="bg-amber-500"
                            />
                            <KPICard 
                                title="Total Users" 
                                value={data.summary.totalUsers.toString()} 
                                icon={Users}
                                trend="+15.0%" 
                                subtext="Registered accounts"
                                color="bg-blue-500"
                            />
                        </div>

                        {/* Charts Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Area Chart */}
                            <div className="lg:col-span-2 bg-background rounded-3xl border border-border p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                            <BarChart3 className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-lg">Revenue Trend</h3>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Revenue</div>
                                    </div>
                                </div>
                                <div className="h-[350px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data.charts.sales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis 
                                                dataKey="_id" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fontSize: 10, fill: '#666', fontWeight: 600 }}
                                                dy={10}
                                                tickFormatter={(str) => {
                                                    const date = new Date(str);
                                                    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                                                }}
                                            />
                                            <YAxis 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fontSize: 10, fill: '#666', fontWeight: 600 }}
                                            />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="revenue" 
                                                stroke="#7c3aed" 
                                                strokeWidth={3}
                                                fillOpacity={1} 
                                                fill="url(#colorSales)" 
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Category Distribution */}
                            <div className="bg-background rounded-3xl border border-border p-8 shadow-sm">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600">
                                        <PieChartIcon className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-lg">Sales by Category</h3>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data.charts.categories}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {data.charts.categories.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Legend 
                                                verticalAlign="bottom" 
                                                align="center"
                                                iconType="circle"
                                                wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Top Products Table */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-background rounded-3xl border border-border overflow-hidden shadow-sm">
                                <div className="px-8 py-6 border-b border-border bg-muted/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <ShoppingBag className="w-5 h-5 text-primary" />
                                        <h3 className="font-bold">Top Selling Products</h3>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">This Period</span>
                                </div>
                                <div className="divide-y divide-border">
                                    {data.topProducts.map((product) => (
                                        <div key={product._id} className="px-8 py-4 flex items-center gap-4 hover:bg-muted/5 transition-colors">
                                            <div className="relative w-12 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                                                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="48px" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate">{product.name}</p>
                                                <p className="text-xs text-muted-foreground">Sold {product.totalSold} units</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-emerald-600 text-sm">₹{product.totalRevenue.toLocaleString('en-IN')}</p>
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase">Revenue</p>
                                            </div>
                                        </div>
                                    ))}
                                    {data.topProducts.length === 0 && (
                                        <div className="py-12 text-center text-muted-foreground text-sm uppercase font-black tracking-widest opacity-30">No products sold yet</div>
                                    )}
                                </div>
                            </div>

                            {/* User Growth Chart */}
                            <div className="bg-background rounded-3xl border border-border p-8 shadow-sm">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <h3 className="font-bold text-lg">User Growth</h3>
                                    </div>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Organic Growth</span>
                                </div>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.charts.users}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis 
                                                dataKey="_id" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fontSize: 9, fill: '#666', fontWeight: 600 }}
                                                tickFormatter={(str) => {
                                                    const date = new Date(str);
                                                    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                                                }}
                                            />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#666', fontWeight: 600 }} />
                                            <Tooltip 
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, trend, subtext, color }: {
    title: string;
    value: string;
    icon: any;
    trend: string;
    subtext: string;
    color: string;
}) {
    const isPositive = trend.startsWith('+');
    
    return (
        <div className="bg-background rounded-3xl border border-border p-6 shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl text-white ${color} shadow-lg shadow-current/20`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {trend}
                </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{title}</p>
            <h4 className="text-3xl font-black text-foreground tracking-tighter mb-2">{value}</h4>
            <p className="text-[10px] font-bold text-muted-foreground italic">{subtext}</p>
        </div>
    );
}

export default function AdminAnalyticsPage() {
    return (
        <AdminGuard>
            <AnalyticsContent />
        </AdminGuard>
    );
}
