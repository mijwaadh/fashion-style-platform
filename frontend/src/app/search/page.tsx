'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import LookCard from '@/components/ui/LookCard';
import { Loader2, SearchX } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import ProductCardWithRating from '@/components/look/ProductCardWithRating';

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [filters, setFilters] = useState({ category: '', mainCategory: '' });
    const [isLoading, setIsLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [results, setResults] = useState<{ looks: any[], creators: any[], products: any[] }>({
        looks: [], creators: [], products: []
    });

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                let url = `/api/search?q=${encodeURIComponent(query)}`;
                if (filters.category) url += `&category=${encodeURIComponent(filters.category)}`;
                if (filters.mainCategory) url += `&mainCategory=${encodeURIComponent(filters.mainCategory)}`;

                const data = await api.get<any>(url);
                setResults(data);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [query, filters]);

    const categories = Array.from(new Set(results.products.map((p: any) => p.category).filter(Boolean)));
    const genders = ["MEN FASHION", "WOMEN FASHION"];

    if (!query) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center px-4">
                <SearchX className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                <h2 className="text-2xl font-bold font-serif text-foreground">What are you looking for?</h2>
                <p className="text-muted-foreground mt-2 max-w-md">Try searching for a style (e.g. &quot;wedding&quot;, &quot;streetwear&quot;), a brand, or find your favorite creators.</p>
            </div>
        );
    }

    if (isLoading && results.products.length === 0) {
        return (
            <div className="flex items-center justify-center py-40">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    const hasResults = results.looks.length > 0 || results.creators.length > 0 || results.products.length > 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 shrink-0 space-y-8">
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-foreground mb-1">Search</h1>
                        <p className="text-sm text-muted-foreground italic">&quot;{query}&quot;</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-black text-foreground uppercase tracking-widest mb-4">Gender</p>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setFilters(f => ({ ...f, mainCategory: '' }))}
                                    className={`block text-sm transition-colors ${filters.mainCategory === '' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    All Genders
                                </button>
                                {genders.map(g => (
                                    <button
                                        key={g}
                                        onClick={() => setFilters(f => ({ ...f, mainCategory: g }))}
                                        className={`block text-sm text-left transition-colors ${filters.mainCategory === g ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        {g === "MEN FASHION" ? "Men" : "Women"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {categories.length > 0 && (
                            <div>
                                <p className="text-[10px] font-black text-foreground uppercase tracking-widest mb-4">Category</p>
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    <button
                                        onClick={() => setFilters(f => ({ ...f, category: '' }))}
                                        className={`block text-sm transition-colors ${filters.category === '' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        All Categories
                                    </button>
                                    {categories.map(c => (
                                        <button
                                            key={c as string}
                                            onClick={() => setFilters(f => ({ ...f, category: c as string }))}
                                            className={`block text-sm text-left transition-colors ${filters.category === c ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            {c as string}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                <div className="flex-1 space-y-16">
                    {!hasResults && !isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <SearchX className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                            <h2 className="text-2xl font-bold font-serif text-foreground">No matches found</h2>
                            <p className="text-muted-foreground mt-2 max-w-md">Try adjusting your filters or search for something broader.</p>
                        </div>
                    ) : (
                        <>
                            {/* Creators Section */}
                            {results.creators.length > 0 && (
                                <section>
                                    <h2 className="text-lg font-bold border-b border-border pb-3 mb-6 flex items-center gap-2">
                                        Creators <span className="bg-muted text-foreground text-[10px] px-2 py-0.5 rounded-full">{results.creators.length}</span>
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {results.creators.map((creator: any) => (
                                            <Link key={creator._id} href={`/creator/${creator._id}`} className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-background hover:bg-muted/50 transition-all group">
                                                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-border">
                                                    <Image src={creator.profileImage || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"} alt={creator.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-foreground truncate text-sm">{creator.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{creator.storeName || 'Creator'}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Looks Section */}
                            {results.looks.length > 0 && (
                                <section>
                                    <h2 className="text-lg font-bold border-b border-border pb-3 mb-6 flex items-center gap-2">
                                        Looks <span className="bg-muted text-foreground text-[10px] px-2 py-0.5 rounded-full">{results.looks.length}</span>
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
                                        {results.looks.map((look: any) => (
                                            <LookCard
                                                key={look._id}
                                                id={look._id}
                                                title={look.title || "Community Look"}
                                                imageUrl={look.imageUrl}
                                                videoUrl={look.videoUrl}
                                                sellerName={look.sellerId?.storeName || look.sellerId?.name || "Aura Creator"}
                                                sellerAvatar={look.sellerId?.profileImage || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"}
                                                occasion={look.occasion?.[0] || 'Style'}
                                                budgetRange={look.budgetRange || "mid-range"}
                                                saves={look.savesCount || 0}
                                                views={look.viewsCount || 0}
                                                likes={look.likesCount || 0}
                                                products={look.productsIncluded}
                                                layoutMetadata={look.layoutMetadata}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Products Section */}
                            {results.products.length > 0 && (
                                <section>
                                    <h2 className="text-lg font-bold border-b border-border pb-3 mb-6 flex items-center gap-2">
                                        Products <span className="bg-muted text-foreground text-[10px] px-2 py-0.5 rounded-full">{results.products.length}</span>
                                    </h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {results.products.map((product: any) => (
                                            <ProductCardWithRating
                                                key={product._id}
                                                product={{
                                                    ...product,
                                                    productUrl: product.affiliateLink, // map for modal compatibility
                                                }}
                                                showReviewCount={false}
                                                showSimilarButton={false}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />
            <main className="flex-1 w-full bg-background/50">
                <Suspense fallback={<div className="flex justify-center py-40"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>}>
                    <SearchResults />
                </Suspense>
            </main>
        </div>
    );
}
