'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    ShoppingBag, 
    Box, 
    Wallet, 
    Package, 
    BarChart3, 
    Settings, 
    Image as ImageIcon,
    Tag,
    Truck,
    HelpCircle,
    LogOut,
    ChevronDown,
    Menu as MenuIcon,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

const menuItems = [
    { name: 'Home', icon: LayoutDashboard, href: '/seller/dashboard' },
    { 
        name: 'Orders', 
        icon: ShoppingBag, 
        href: '/seller/orders',
        badge: 'NEW',
        subItems: [
            { name: 'Manage Orders', href: '/seller/orders' },
            { name: 'Returns', href: '/seller/orders/returns' }
        ]
    },
    { name: 'Inventory', icon: Box, href: '/seller/products' },
    { name: 'Payouts', icon: Wallet, href: '/seller/payouts' },
    { name: 'Promotions', icon: Tag, href: '/seller/promotions' },
    { name: 'Analytics', icon: BarChart3, href: '/seller/analytics' },
    { name: 'Settings', icon: Settings, href: '/seller/settings' },
];

export default function SellerSidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [openMenus, setOpenMenus] = useState<string[]>(['Orders']);

    const toggleMenu = (name: string) => {
        setOpenMenus(prev => 
            prev.includes(name) ? prev.filter(m => m !== name) : [...prev, name]
        );
    };

    return (
        <aside className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1a1a] text-white flex flex-col border-r border-white/5",
            className
        )}>
            {/* Header / Logo */}
            <div className="h-16 flex items-center px-6 border-b border-white/5">
                <Link href="/seller/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-black text-lg text-white">
                        A
                    </div>
                    <span className="font-serif font-bold text-xl tracking-tight uppercase">Supplier Hub</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || item.subItems?.some(s => pathname === s.href);
                    const isOpen = openMenus.includes(item.name);

                    return (
                        <div key={item.name} className="space-y-1">
                            {item.subItems ? (
                                <>
                                    <button
                                        onClick={() => toggleMenu(item.name)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                                            isActive ? "bg-primary/10 text-primary" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-zinc-500 group-hover:text-white")} />
                                            <span>{item.name}</span>
                                            {item.badge && (
                                                <span className="ml-Auto px-1.5 py-0.5 rounded-md bg-rose-500 text-[10px] font-bold text-white leading-none">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
                                    </button>
                                    
                                    {isOpen && (
                                        <div className="ml-10 space-y-1 pt-1">
                                            {item.subItems.map((sub) => (
                                                <Link
                                                    key={sub.name}
                                                    href={sub.href}
                                                    className={cn(
                                                        "block px-3 py-2 rounded-lg text-xs transition-colors",
                                                        pathname === sub.href ? "text-white font-bold" : "text-zinc-500 hover:text-white"
                                                    )}
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                                        isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-zinc-500 group-hover:text-white")} />
                                    <span>{item.name}</span>
                                </Link>
                            )}
                        </div>
                    );
                })}

                <div className="pt-8 px-3">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">Support</p>
                    <Link href="/seller/support" className="flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-white text-sm transition-colors">
                        <HelpCircle className="w-5 h-5" />
                        <span>Help Center</span>
                    </Link>
                </div>
            </nav>

            {/* User Profile / Footer */}
            <div className="p-4 border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-lg text-primary capitalize">
                        {user?.name?.[0] || 'S'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold truncate text-white">{user?.storeName || user?.name || 'Seller'}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
                    </div>
                </div>
                <button 
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 text-rose-500 text-sm font-bold hover:bg-rose-500 hover:text-white transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
