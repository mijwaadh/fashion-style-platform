'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Eye, Bookmark, Loader2, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface Look {
    _id: string;
    title: string;
    imageUrl: string;
    savesCount: number;
    viewsCount: number;
    status: 'draft' | 'published';
    isInternal: boolean;
}

export default function SellerLooksPage() {
    return <SellerLooksContent />;
}

function SellerLooksContent() {
    const [looks, setLooks] = useState<Look[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLooks = async () => {
            try {
                const data = await api.get<{ looks: Look[] }>('/api/looks/my-outfits');
                setLooks(data.looks || []);
            } catch (err) {
                console.error("Failed to load looks:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLooks();
    }, []);

    return (
        <div className="min-h-screen bg-muted/30 pb-20">
            <header className="bg-background border-b border-border sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/seller/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="font-serif text-xl font-bold text-foreground">My Looks</h1>
                    </div>
                    <Button asChild variant="default" className="rounded-full px-5">
                        <Link href="/seller/looks/new"><Plus className="w-4 h-4 mr-2" /> Create Look</Link>
                    </Button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 mt-8">
                {/* Info Banner */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-700 flex items-start gap-3">
                    <Flame className="w-5 h-5 mt-0.5 shrink-0 text-orange-500" />
                    <div>
                        <p className="font-semibold text-foreground mb-1">How looks get featured</p>
                        <p className="text-muted-foreground">Your looks are saved as personal drafts. An admin can feature any of your looks in the public <strong>Trending</strong> discover feed.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
                ) : looks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-background rounded-2xl border border-border shadow-sm text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Image src="/favicon.ico" alt="Empty" width={32} height={32} className="opacity-50" />
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-foreground mb-2">No Looks Yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">Start building your aesthetic by uploading complete outfit photos and tagging your products.</p>
                        <Button asChild variant="default" className="rounded-full px-8">
                            <Link href="/seller/looks/new">Create First Look</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {looks.map(look => (
                            <Link
                                key={look._id}
                                href={`/look/${look._id}`}
                                className="group bg-background rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all block"
                            >
                                <div className="relative aspect-[3/4] w-full bg-secondary overflow-hidden">
                                    <Image src={look.imageUrl} alt={look.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                    {/* Status badge */}
                                    <div className="absolute top-2 left-2">
                                        {look.isInternal ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500 text-white rounded-full text-[10px] font-bold shadow-sm">
                                                <Flame className="w-3 h-3" /> Trending
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 bg-black/60 text-white/80 rounded-full text-[10px] font-semibold backdrop-blur-sm">
                                                Pending Review
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-foreground text-sm mb-2 truncate">{look.title}</h3>
                                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                        <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {look.viewsCount || 0}</span>
                                        <span className="flex items-center gap-1.5"><Bookmark className="w-4 h-4" /> {look.savesCount || 0}</span>
                                        <span className="ml-auto text-xs text-muted-foreground italic">
                                            {look.isInternal ? 'In feed ✓' : 'Awaiting feature'}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
