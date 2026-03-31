'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Bookmark, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import LookCard from '@/components/ui/LookCard';

export default function SavedLooksPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
            <SavedPageContent />
        </Suspense>
    );
}

function SavedPageContent() {
     
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');

    const [looks, setLooks] = useState<any[]>([]);
    const [myOutfits, setMyOutfits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'saved' | 'my-outfits'>(
        tabParam === 'my-outfits' ? 'my-outfits' : 'saved'
    );

    useEffect(() => {
        const fetchSavedLooks = async () => {
            try {
                const data = await api.get<any[]>('/api/users/saves');
                setLooks(data);
            } catch (error) {
                console.error('Failed to fetch saved looks:', error);
            }
        };

        const fetchMyOutfits = async () => {
            try {
                const data = await api.get<any>('/api/looks/my-outfits');
                setMyOutfits(data.looks || []);
            } catch (error) {
                console.error('Failed to fetch my outfits:', error);
            }
        };

        const loadData = async () => {
            setLoading(true);
            const userStr = sessionStorage.getItem('aura_user');
            if (userStr) {
                await Promise.all([fetchSavedLooks(), fetchMyOutfits()]);
            }
            setLoading(false);
        };

        loadData();
    }, []);

    const currentLooks = activeTab === 'saved' ? looks : myOutfits;

    return (
        <div className="min-h-screen bg-muted/20 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
                    <div className="bg-primary/10 p-3 rounded-full">
                        <Bookmark className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="font-serif text-3xl font-bold text-foreground">Studio & Saved</h1>
                        <p className="text-muted-foreground mt-1">Manage your created outfits and saved fashion inspiration.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-8 mb-8 border-b border-border">
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`pb-4 text-sm font-bold tracking-tight uppercase transition-all relative ${activeTab === 'saved' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Saved Looks ({looks.length})
                        {activeTab === 'saved' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('my-outfits')}
                        className={`pb-4 text-sm font-bold tracking-tight uppercase transition-all relative ${activeTab === 'my-outfits' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        My Outfits ({myOutfits.length})
                        {activeTab === 'my-outfits' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : currentLooks.length === 0 ? (
                    <div className="text-center py-20 bg-background rounded-3xl border border-border border-dashed">
                        <div className="bg-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bookmark className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-bold font-serif mb-2">
                            {activeTab === 'saved' ? 'No looks saved yet' : 'No outfits created yet'}
                        </h2>
                        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                            {activeTab === 'saved'
                                ? 'Start exploring the discovery feed and tap the heart icon on any outfit to add it to your mood board.'
                                : 'Step into the studio and start building your first digital outfit composition.'
                            }
                        </p>
                        <Link href={activeTab === 'saved' ? "/" : "/looks/create"} className="inline-flex items-center justify-center rounded-full text-sm font-medium bg-foreground text-background h-10 px-8 py-2 hover:scale-105 transition-transform">
                            {activeTab === 'saved' ? 'Explore Looks' : 'Create My First Look'}
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                        {currentLooks.map((look) => (
                            <div key={look._id} className="relative group">
                                {activeTab === 'my-outfits' && (
                                    <div className={`absolute top-3 right-3 z-10 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${look.status === 'published' ? 'bg-green-500 text-white' : 'bg-amber-500 text-white shadow-lg'}`}>
                                        {look.status}
                                    </div>
                                )}
                                <LookCard
                                    id={look._id}
                                    title={look.title || "Untitled Look"}
                                    imageUrl={look.imageUrl}
                                    videoUrl={look.videoUrl}
                                    creatorName={look.sellerId?.name || "Aura Creator"}
                                    creatorAvatar={look.sellerId?.profileImage || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"}
                                    creatorId={look.sellerId?._id}
                                    occasion={look.occasion && look.occasion.length > 0 ? look.occasion[0] : "Style"}
                                    budgetRange={look.budgetRange || "mid-range"}
                                    saves={look.savesCount || 0}
                                    views={look.viewsCount || 0}
                                    likes={look.likesCount || 0}
                                    products={look.productsIncluded}
                                    layoutMetadata={look.layoutMetadata}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
