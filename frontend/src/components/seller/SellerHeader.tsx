'use client';

import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

export default function SellerHeader() {
    const { user } = useAuth();
    const pathname = usePathname();

    // Simple breadcrumb logic
    const pathParts = pathname.split('/').filter(Boolean);
    const currentPage = pathParts[pathParts.length - 1] || 'Dashboard';

    return (
        <header className="h-16 bg-white border-b border-zinc-200 sticky top-0 z-40 px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <h1 className="text-lg font-serif font-black text-zinc-900 capitalize tracking-tight">
                    {currentPage.replace(/-/g, ' ')}
                </h1>
                <div className="h-4 w-px bg-zinc-200" />
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    <span>Aura</span>
                    <span>/</span>
                    <span className="text-zinc-600">Supplier Panel</span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Search Bar */}
                <div className="hidden md:flex items-center gap-2 bg-zinc-100 px-3 py-2 rounded-xl w-64 border border-transparent focus-within:border-primary/20 focus-within:bg-white transition-all">
                    <Search className="w-4 h-4 text-zinc-400" />
                    <input 
                        type="text" 
                        placeholder="Search orders, products..." 
                        className="bg-transparent border-none text-sm focus:outline-none w-full placeholder:text-zinc-400"
                    />
                </div>

                {/* Notifications */}
                <button className="relative p-2 text-zinc-400 hover:text-primary transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                </button>

                {/* User Info */}
                <div className="flex items-center gap-3 pl-6 border-l border-zinc-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-zinc-900 leading-none mb-1">{user?.name}</p>
                        <p className="text-[10px] text-zinc-500 font-medium">Seller ID: #{user?._id?.toString().slice(-6)}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold border border-zinc-200">
                        {user?.name?.[0]}
                    </div>
                </div>
            </div>
        </header>
    );
}
