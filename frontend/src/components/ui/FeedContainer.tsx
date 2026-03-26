'use client';

import { useState, useEffect } from 'react';
import LookCard from './LookCard';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FeedContainerProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialLooks: any[];
}

export default function FeedContainer({ initialLooks }: FeedContainerProps) {
    const [activeTab, setActiveTab] = useState<'explore' | 'following'>('explore');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [looks, setLooks] = useState<any[]>(initialLooks);
    const [isLoading, setIsLoading] = useState(false);
    const [isFollowingSomeone, setIsFollowingSomeone] = useState(true);

    useEffect(() => {
        if (activeTab === 'explore') {
            setLooks(initialLooks);
            return;
        }

        const fetchFollowing = async () => {
            setIsLoading(true);
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data = await api.get<any>('/api/looks/feed/following');
                setLooks(data.looks || []);
                setIsFollowingSomeone(data.isFollowingSomeone ?? true);
            } catch (error) {
                console.error("Failed to fetch following feed", error);
                setLooks([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFollowing();
    }, [activeTab, initialLooks]);

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">

            <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-10 gap-4">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-foreground">
                        {activeTab === 'explore' ? 'Trending Looks' : 'Your Feed'}
                    </h2>
                    <p className="text-muted-foreground mt-2 font-medium">
                        {activeTab === 'explore'
                            ? 'Curated styles from our top creators this week.'
                            : 'Latest styles from the creators you follow.'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex bg-muted/50 p-1 rounded-full border border-border">
                    <button
                        onClick={() => setActiveTab('explore')}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'explore'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Explore
                    </button>
                    <button
                        onClick={() => {
                            if (!sessionStorage.getItem('aura_user')) {
                                toast.error("Please sign in to view your personalized following feed.");
                                return;
                            }
                            setActiveTab('following');
                        }}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === 'following'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Following
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : looks.length === 0 ? (
                <div className="py-20 text-center max-w-2xl mx-auto px-4">
                    <div className="bg-muted/20 border-2 border-dashed border-border p-12 rounded-[40px]">
                        <p className="text-lg font-medium text-muted-foreground leading-relaxed">
                            {activeTab === 'following'
                                ? (!isFollowingSomeone
                                    ? "You aren't following anyone yet! Head to Explore to discover creators."
                                    : "The creators you are following haven't published any looks yet!")
                                : "No trendy looks found right now. Be the first to create one!"}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                    {looks.map((look: {
                        _id: { toString: () => string };
                        title?: string;
                        imageUrl: string;
                        videoUrl?: string;
                        sellerId?: { _id: string; storeName?: string; name?: string; profileImage?: string };
                        occasion?: string[];
                        budgetRange?: string;
                        savesCount?: number;
                        viewsCount?: number;
                        likesCount?: number;
                        productsIncluded?: any[];
                        layoutMetadata?: Record<string, any>;
                    }) => (
                        <div key={look._id.toString()} className="break-inside-avoid mb-6">
                            <LookCard
                                id={look._id.toString()}
                                title={look.title || "Untitled Look"}
                                imageUrl={look.imageUrl}
                                videoUrl={look.videoUrl}
                                sellerName={look.sellerId?.storeName || look.sellerId?.name || "Aura Creator"}
                                sellerId={look.sellerId?._id}
                                sellerAvatar={look.sellerId?.profileImage || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"}
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
        </section>
    );
}
