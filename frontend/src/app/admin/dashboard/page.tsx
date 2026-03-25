import Link from 'next/link';
import Image from 'next/image';
import {
    Users, ShoppingBag, TrendingUp, AlertTriangle, LayoutGrid, Package,
    BarChart2, Shield, Settings, LogOut, CheckCircle2, XCircle, Eye, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const stats = [
    { label: 'Total Users', value: '18,420', icon: Users, change: '+230 this week' },
    { label: 'Active Sellers', value: '312', icon: ShoppingBag, change: '+14 pending' },
    { label: 'Published Looks', value: '5,841', icon: TrendingUp, change: '+88 today' },
    { label: 'Flagged Content', value: '7', icon: AlertTriangle, change: 'Needs review', urgent: true },
];

const PENDING_SELLERS = [
    { id: 's1', name: 'Luxe Closet', email: 'luxe@example.com', joinedDate: 'Mar 3, 2026', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=100' },
    { id: 's2', name: 'Urban Thread Co.', email: 'urban@example.com', joinedDate: 'Mar 2, 2026', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100' },
];

const RECENT_USERS = [
    { id: 'u1', name: 'Priya Sharma', email: 'priya@example.com', role: 'user', status: 'Active', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100' },
    { id: 'u2', name: 'James Okafor', email: 'james@example.com', role: 'seller', status: 'Active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100' },
    { id: 'u3', name: 'Wei Liu', email: 'wei@example.com', role: 'user', status: 'Suspended', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100' },
];

const navItems = [
    { icon: LayoutGrid, label: 'Overview', href: '/admin/dashboard', active: true },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: ShoppingBag, label: 'Sellers', href: '/admin/sellers' },
    { icon: Package, label: 'Products', href: '/admin/products' },
    { icon: Package, label: 'Looks', href: '/admin/looks' },
    { icon: DollarSign, label: 'Payouts', href: '/admin/payouts' },
    { icon: Shield, label: 'Moderation', href: '/admin/moderation' },
    { icon: BarChart2, label: 'Analytics', href: '/admin/analytics' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminDashboard() {
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
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center text-background text-xs font-bold">A</div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Super Admin</p>
                            <p className="text-xs text-muted-foreground">admin@aura.com</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all-smooth w-full">
                        <LogOut className="w-4 h-4" />Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-10">

                    {/* Header */}
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-foreground">Platform Overview</h1>
                        <p className="text-muted-foreground mt-1">Wednesday, March 4, 2026</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map(({ label, value, icon: Icon, change, urgent }) => (
                            <div key={label} className={`bg-background rounded-2xl p-6 border shadow-sm space-y-3 ${urgent ? 'border-red-300 bg-red-50' : 'border-border'}`}>
                                <div className="flex items-center justify-between">
                                    <p className={`text-sm font-medium ${urgent ? 'text-red-600' : 'text-muted-foreground'}`}>{label}</p>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${urgent ? 'bg-red-100' : 'bg-muted'}`}>
                                        <Icon className={`w-4 h-4 ${urgent ? 'text-red-600' : 'text-foreground'}`} />
                                    </div>
                                </div>
                                <div>
                                    <p className={`text-2xl font-bold font-serif ${urgent ? 'text-red-600' : 'text-foreground'}`}>{value}</p>
                                    <p className={`text-xs font-semibold mt-1 ${urgent ? 'text-red-400' : 'text-primary'}`}>{change}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pending Seller Approvals */}
                    <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="flex justify-between items-center px-6 py-5 border-b border-border">
                            <h2 className="font-serif text-xl font-bold text-foreground">Pending Seller Approvals</h2>
                            <Badge variant="secondary">{PENDING_SELLERS.length} pending</Badge>
                        </div>
                        <div className="divide-y divide-border">
                            {PENDING_SELLERS.map(seller => (
                                <div key={seller.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-secondary shrink-0">
                                        <Image src={seller.avatar} alt={seller.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-foreground">{seller.name}</p>
                                        <p className="text-sm text-muted-foreground">{seller.email}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground hidden sm:block">Applied {seller.joinedDate}</p>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                        <Button variant="ghost" size="sm" className="rounded-full text-xs hidden sm:flex">
                                            <Eye className="w-4 h-4 mr-1" />View
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Users */}
                    <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
                        <div className="flex justify-between items-center px-6 py-5 border-b border-border">
                            <h2 className="font-serif text-xl font-bold text-foreground">Recent Users</h2>
                            <Link href="/admin/users" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">View all →</Link>
                        </div>
                        <div className="divide-y divide-border">
                            {RECENT_USERS.map(user => (
                                <div key={user.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-secondary shrink-0">
                                        <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-foreground">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                    <Badge variant={user.role === 'seller' ? 'creamy' : 'secondary'} className="capitalize">{user.role}</Badge>
                                    <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>{user.status}</Badge>
                                    <Button variant="ghost" size="sm" className="rounded-full text-xs hidden sm:flex">Manage</Button>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
