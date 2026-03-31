"use client";

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { CheckCircle2, MapPin, Search } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import LookCard from '@/components/ui/LookCard';
import ProductCardWithRating from '@/components/look/ProductCardWithRating';
import FollowButton, { FollowerCount } from '@/components/ui/FollowButton';

export default function CreatorProfileClient({ profileData, id }: { profileData: any, id: string }) {
    const { profile, looks = [], products = [], collections = [] } = profileData;
    const [activeTab, setActiveTab] = useState<'looks' | 'products' | 'collections'>('looks');
    const [searchQuery, setSearchQuery] = useState('');
    
    const coverImage = "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80";
    const avatar = profile.profileImage || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250";

    const filteredLooks = useMemo(() => {
        if (!searchQuery.trim()) return looks;
        return looks.filter((l: any) => 
            l.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            l.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [looks, searchQuery]);

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return products;
        return products.filter((p: any) => 
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <main className="flex-1 w-full pb-20">
                {/* Cover Image */}
                <div className="relative w-full h-64 md:h-80 lg:h-96">
                    <Image
                        src={coverImage}
                        alt="Cover"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-32 relative z-10 w-full mb-16">
                    {/* Profile Header Card */}
                    <div className="bg-background rounded-3xl p-6 sm:p-10 shadow-xl border border-border flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                        {/* Avatar */}
                        <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-background bg-muted shrink-0 shadow-sm">
                            <Image src={avatar} alt={profile.name} fill className="object-cover" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-4 w-full">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                                <div>
                                    <h1 className="flex items-center justify-center md:justify-start gap-2 text-3xl sm:text-4xl font-serif font-bold text-foreground">
                                        {profile.name}
                                    </h1>
                                </div>
                                <div className="w-full md:w-auto flex flex-col gap-3 shrink-0">
                                    <FollowButton targetId={id} initialFollowers={profile.followersCount} />
                                </div>
                            </div>

                            <p className="text-foreground/80 leading-relaxed max-w-2xl text-lg mx-auto md:mx-0">
                                {profile.bio || "Creator on Aura."}
                            </p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-3 gap-x-6 text-sm text-muted-foreground font-medium pt-2">
                                <div className="flex gap-4 items-center">
                                    <span className="text-foreground"><strong className="text-lg mr-1"><FollowerCount targetId={id} initialCount={profile.followersCount} /></strong>followers</span>
                                    <span className="text-foreground"><strong className="text-lg mr-1">{profile.followingCount}</strong>following</span>
                                </div>
                                <div className="hidden sm:block w-1 h-1 rounded-full bg-border" />
                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />Global</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs / Filters */}
                    <div className="mt-12 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border">
                        <div className="flex items-center gap-8">
                            {[
                                { id: 'looks', label: 'Posts', count: looks.length },
                                { id: 'products', label: 'Products', count: products.length },
                                { id: 'collections', label: 'Collections', count: collections.length }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`pb-4 font-semibold text-lg transition-all border-b-2 ${activeTab === tab.id ? 'text-foreground border-primary' : 'text-muted-foreground border-transparent'}`}
                                >
                                    {tab.label} ({tab.count})
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-64 mb-4 md:mb-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`Search ${activeTab}...`}
                                className="w-full pl-10 pr-4 py-2 bg-muted/50 border-none rounded-full text-sm focus:ring-1 focus:ring-primary transition-all"
                            />
                        </div>
                    </div>

                    {/* Content Section */}
                    {activeTab === 'looks' ? (
                        filteredLooks.length > 0 ? (
                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12 animate-in fade-in duration-500">
                                {filteredLooks.map((look: any) => (
                                    <LookCard
                                        key={look._id}
                                        id={look._id}
                                        title={look.title || "Creator Look"}
                                        imageUrl={look.imageUrl}
                                        videoUrl={look.videoUrl}
                                        sellerName={profile.name || "Aura Creator"}                                      sellerAvatar={avatar}
                                        occasion={look.occasion?.[0] || 'Style'}
                                        budgetRange={look.budgetRange || "mid-range"}
                                        saves={look.savesCount || 0}
                                        views={look.viewsCount || 0}
                                        likes={look.likesCount || 0}
                                        products={look.productsIncluded?.map((p: any) => ({ ...p.product, matchType: p.matchType }))}
                                        layoutMetadata={look.layoutMetadata}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 mt-8 mb-20 bg-background rounded-2xl border border-dashed border-border border-2">
                                <p className="text-muted-foreground">{searchQuery ? "No posts match your search." : "This creator hasn't published any looks yet."}</p>
                            </div>
                        )
                    ) : activeTab === 'products' ? (
                        filteredProducts.length > 0 ? (
                            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-in fade-in duration-500">
                                {filteredProducts.map((product: any) => (
                                    <ProductCardWithRating
                                        key={product._id}
                                        product={product}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 mt-8 mb-20 bg-background rounded-2xl border border-dashed border-border border-2">
                                <p className="text-muted-foreground">{searchQuery ? "No products match your search." : "This creator hasn't added any products yet."}</p>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-20 mt-8 mb-20 bg-background rounded-2xl border border-dashed border-border border-2">
                            <p className="text-muted-foreground">Collections coming soon.</p>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
