'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutGrid, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';

interface Collection {
    _id: string;
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    looks: any[];
}

export default function CollectionsDashboard() {
    const router = useRouter();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const user = sessionStorage.getItem('aura_user');
        if (!user) {
            router.push('/auth/login?redirect=/saved/collections');
            return;
        }

        const fetchCollections = async () => {
            try {
                const data = await api.get<Collection[]>('/api/collections');
                setCollections(data);
            } catch (err) {
                console.error('Failed to load collections', err);
                setError('Could not load your collections at this time.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCollections();
    }, [router]);

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 mt-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
                        <LayoutGrid className="w-8 h-8 text-primary" />
                        My Boards
                    </h1>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20 text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 mb-6">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                ) : collections.length === 0 ? (
                    <div className="text-center py-32 bg-background rounded-3xl border border-border shadow-sm">
                        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                            <LayoutGrid className="w-10 h-10 text-muted-foreground/50" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">No boards yet</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            Save your favorite looks into curated boards to inspire your next outfit.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {collections.map(col => (
                            <Link href={`/saved/collections/${col._id}`} key={col._id}>
                                <div className="group rounded-3xl overflow-hidden bg-background border border-border shadow-sm hover:shadow-md transition-all cursor-pointer">
                                    <div className="aspect-[4/3] bg-secondary w-full relative overflow-hidden flex items-center justify-center">
                                        {/* Since collection.looks returned by GET /api/collections is just an array of IDs in this implementation without .populate('looks'), we show a placeholder for now */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-muted/80 to-muted/20" />
                                        <h3 className="relative font-serif text-4xl text-muted-foreground/40 font-bold uppercase tracking-wider group-hover:scale-110 transition-transform duration-700">
                                            {col.name.charAt(0)}
                                        </h3>
                                    </div>
                                    <div className="p-5">
                                        <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">{col.name}</h3>
                                        <p className="text-sm text-muted-foreground">{col.looks.length} saved {col.looks.length === 1 ? 'look' : 'looks'}</p>
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
