'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Bookmark, Eye, Loader2, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { api, getSavedLookIds, clearSavedLookCache } from '@/lib/api';
import HorizontalProductCarousel from '@/components/look/HorizontalProductCarousel';

interface LookCardProps {
    id: string;
    title: string;
    imageUrl: string;
    videoUrl?: string;
    sellerName: string;
    sellerId?: string; // Link to profile
    sellerAvatar: string;
    occasion: string;
    budgetRange: string;
    saves: number;
    views: number;
    likes: number;
    products?: any[];
    layoutMetadata?: Record<string, any>;
}

export default function LookCard({
    id,
    title,
    imageUrl,
    videoUrl,
    sellerName,
    sellerId,
    sellerAvatar,
    occasion,
    budgetRange,
    saves: initialSaves,
    views,
    likes: initialLikes,
    products = [],
    layoutMetadata = {}
}: LookCardProps) {
    // ... (state and effects same as before)
    const [isSaved, setIsSaved] = useState(false);
    const [savesCount, setSavesCount] = useState(initialSaves);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(initialLikes);
    const [isSaving, setIsSaving] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

    useEffect(() => {
        let mounted = true;
        getSavedLookIds().then(ids => {
            if (mounted && ids.includes(id)) {
                setIsSaved(true);
            }
        });

        const userStr = localStorage.getItem('aura_user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.likedLooks?.includes(id)) {
                    setIsLiked(true);
                }
            } catch { /* ignore */ }
        }

        return () => { mounted = false; };
    }, [id]);

    const toggleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const userStr = localStorage.getItem('aura_user');
        if (!userStr) {
            alert('Please login to save looks!');
            return;
        }

        setIsSaving(true);
        // Optimistic update
        const newIsSaved = !isSaved;
        setIsSaved(newIsSaved);
        setSavesCount(prev => newIsSaved ? prev + 1 : prev - 1);

        try {
            const res = await api.post<any>(`/api/users/saves/${id}`, {});
            setIsSaved(res.saved);
            clearSavedLookCache();
        } catch (error) {
            // Revert on failure
            setIsSaved(isSaved);
            setSavesCount(savesCount);
            console.error('Failed to save look:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const userStr = localStorage.getItem('aura_user');
        if (!userStr) {
            alert('Please login to like looks!');
            return;
        }

        setIsLiking(true);
        // Optimistic update
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

        try {
            const res = await api.post<any>(`/api/looks/${id}/like`, {});
            setIsLiked(res.isLiked);
            setLikesCount(res.likesCount);

            // Update localstorage user
            const user = JSON.parse(userStr);
            if (!user.likedLooks) user.likedLooks = [];
            if (res.isLiked) {
                if (!user.likedLooks.includes(id)) user.likedLooks.push(id);
            } else {
                user.likedLooks = user.likedLooks.filter((lid: string) => lid !== id);
            }
            localStorage.setItem('aura_user', JSON.stringify(user));
        } catch (error) {
            // Revert
            setIsLiked(isLiked);
            setLikesCount(likesCount);
            console.error('Failed to like look:', error);
        } finally {
            setIsLiking(false);
        }
    };

    // Flatten products from { product: P, matchType: T } to P with matchType
    const flattenedProducts = products?.map(p => {
        if (p.product && typeof p.product === 'object') {
            return {
                ...p.product,
                matchType: p.matchType || 'exact'
            };
        }
        return p; // fallback for old data
    }) || [];

    const hasLayout = layoutMetadata && Object.keys(layoutMetadata).length > 0;
    const hasSale = flattenedProducts.some(p => (p.discountPercentage && p.discountPercentage > 0) || (p.salePrice && p.salePrice < p.price));

    return (
        <div className="group relative flex flex-col gap-3">
            <Link href={`/look/${id}`} className="relative aspect-[3/4] w-full block overflow-hidden rounded-xl bg-secondary shadow-sm">
                {!hasLayout ? (
                    videoUrl ? (
                        <video
                            src={videoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <Image
                            src={imageUrl}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    )
                ) : (
                    <div className="absolute inset-0 bg-[#F9F9F7] overflow-hidden">
                        {/* 
                            Visual Composition Preview (High Fidelity)
                            Pinterest-inspired arrangement with soft shadows and 
                            clean cream background for a premium fee.
                        */}
                        {flattenedProducts.map((p) => {
                            const meta = layoutMetadata[p._id];
                            if (!meta) return null;

                            const isPercentage = typeof meta.x === 'number' && meta.x <= 100;
                            const left = isPercentage ? `${meta.x}%` : `${meta.x / 5}px`;
                            const top = isPercentage ? `${meta.y}%` : `${meta.y / 5}px`;

                            return (
                                <div
                                    key={p._id}
                                    className="absolute transform-gpu drop-shadow-xl"
                                    style={{
                                        left,
                                        top,
                                        zIndex: meta.zIndex,
                                        width: '45%', // Slightly larger for better impact
                                        aspectRatio: '3/4',
                                        transform: `scale(${meta.scale})`,
                                        transformOrigin: 'top left',
                                        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.08))'
                                    }}
                                >
                                    <Image
                                        src={p.imageUrl}
                                        alt={p.name}
                                        fill
                                        className="object-contain"
                                        sizes="(max-width: 768px) 30vw, 15vw"
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Overlay Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Badge variant="white" className="capitalize">{occasion}</Badge>
                    <Badge variant="white" className="capitalize">{budgetRange}</Badge>
                    {hasSale && (
                        <Badge variant="destructive" className="animate-pulse">SALE ALERT</Badge>
                    )}
                </div>
            </Link>

            {/* Action Overlay (Absolutely Positioned OUTSIDE the Link) */}
            <div className="absolute top-[65%] left-0 right-0 bottom-auto bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none rounded-b-xl z-10">
                <div className="flex justify-between items-center text-white pointer-events-auto">
                    <span className="font-serif font-medium truncate pr-2 text-shadow-sm">{title}</span>
                    <div className="flex gap-2 pointer-events-auto">
                        <button
                            onClick={toggleSave}
                            disabled={isSaving}
                            className={`rounded-full p-2 backdrop-blur-md transition-all duration-300 shadow-sm ${isSaved ? 'bg-primary text-white' : 'bg-white/20 hover:bg-white/40 text-white'}`}
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Shoppable Carousel (LTK Style) */}
            {flattenedProducts.length > 0 && (
                <HorizontalProductCarousel products={flattenedProducts} />
            )}

            {/* Meta Info */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <Link href={sellerId ? `/creator/${sellerId}` : '#'} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden bg-muted">
                            <Image src={sellerAvatar} alt={sellerName} fill className="object-cover" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{sellerName}</span>
                    </Link>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
                        <span className={isLiked ? 'text-red-500 font-medium' : ''}>{likesCount}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
