import SellerGuard from '@/components/layout/SellerGuard';
import SellerSidebar from '@/components/seller/SellerSidebar';
import SellerHeader from '@/components/seller/SellerHeader';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
    return (
        <SellerGuard>
            <div className="flex min-h-screen bg-zinc-50 font-sans">
                {/* Fixed Sidebar */}
                <SellerSidebar className="hidden lg:flex" />

                {/* Main Content Area */}
                <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                    <SellerHeader />
                    
                    <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                        {children}
                    </main>

                    {/* Footer / Status Bar (Meesho-style) */}
                    <footer className="h-10 bg-white border-t border-zinc-200 px-8 flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <div className="flex items-center gap-4">
                            <span>Aura Supplier Hub v1.0</span>
                            <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                            <span className="text-emerald-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                System Operational
                            </span>
                        </div>
                        <div>
                            &copy; 2026 Aura Fashion
                        </div>
                    </footer>
                </div>
            </div>
        </SellerGuard>
    );
}
