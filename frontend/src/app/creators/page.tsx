'use client';

import { useState, useEffect } from 'react';
import { Users, Loader2, Compass } from 'lucide-react';
import { api } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import LookCard from '@/components/ui/LookCard';
import Link from 'next/link';

export default function CreatorsPage() {
    const [looks, setLooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCreatorLooks = async () => {
            try {
                // Fetch looks that are NOT internal (user-created) and published
                const data = await api.get<any>('/api/looks?isInternal=false');
                setLooks(data.looks || []);
            } catch (error) {
                console.error('Failed to fetch creators looks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCreatorLooks();
    }, []);

    return (
        <div className="min-h-screen bg-[#FDFCFB] flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary text-[10px] font-black uppercase tracking-widest">
                            <Users className="w-3.5 h-3.5" /> Community Outfits
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tight">Creators Studio</h1>
                        <p className="text-muted-foreground text-lg max-w-2xl font-medium">
                            Explore the latest styling compositions from our creative community.
                            Built in our digital atelier by fashion enthusiasts like you.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <Loader2 className="w-10 h-10 animate-spin text-primary/30" />
                    </div>
                ) : looks.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-[40px] border border-border shadow-sm">
                        <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Compass className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold font-serif mb-3">Be the first creator!</h2>
                        <p className="text-muted-foreground mb-10 max-w-xs mx-auto">
                            No community looks have been published yet. Head to the studio to show off your style.
                        </p>
                        <Link href="/looks/create" className="inline-flex items-center justify-center rounded-full text-sm font-black bg-primary text-white h-12 px-10 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                            Open Studio
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
                        {looks.map((look) => (
                            <LookCard
                                key={look._id}
                                id={look._id}
                                title={look.title || "Community Look"}
                                imageUrl={look.imageUrl}
                                videoUrl={look.videoUrl}
                                sellerName={look.creatorId?.name || "Aura Creator"}
                                sellerAvatar={look.creatorId?.profileImage || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"}
                                occasion={look.occasion && look.occasion.length > 0 ? look.occasion[0] : "Daily Style"}
                                budgetRange={look.budgetRange || "mid-range"}
                                saves={look.savesCount || 0}
                                views={look.viewsCount || 0}
                                likes={look.likesCount || 0}
                                products={look.productsIncluded}
                                layoutMetadata={look.layoutMetadata}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
