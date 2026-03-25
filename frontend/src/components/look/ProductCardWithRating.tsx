'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Bookmark, Loader2, Star, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface Product {
    _id: string;
    imageUrl: string;
    brand: string;
    name: string;
    price: number;
    description?: string;
    productUrl?: string;
    productType?: string;
    category?: string;
    images?: string[];
    likesCount?: number;
    savesCount?: number;
    viewsCount?: number;
    sharesCount?: number;
    averageRating?: number;
    reviewCount?: number;
    sellerId?: {
        _id: string;
        name: string;
        storeName?: string;
    };
}

interface SimilarProduct {
    _id: string;
    imageUrl: string;
    brand: string;
    name: string;
    price: number;
    productUrl?: string;
    likesCount?: number;
    averageRating?: number;
}

function SimilarProductsInline({ productId, onProductClick }: {
    productId: string;
    onProductClick: (p: SimilarProduct) => void;
}) {
    const [products, setProducts] = useState<SimilarProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get<SimilarProduct[]>(`/api/products/${productId}/similar`)
            .then(data => setProducts(data || []))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [productId]);

    if (loading) return (
        <div className="flex justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
        </div>
    );

    if (products.length === 0) return (
        <p className="text-xs text-muted-foreground text-center py-3 italic">No similar products found.</p>
    );

    return (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
            {products.map(p => (
                <button
                    key={p._id}
                    onClick={() => onProductClick(p)}
                    className="flex-none w-32 snap-start group text-left"
                >
                    <div className="relative w-32 h-44 rounded-2xl overflow-hidden bg-muted mb-2 ring-1 ring-border group-hover:ring-primary/40 transition-all shadow-sm">
                        <Image
                            src={p.imageUrl}
                            alt={p.name}
                            fill
                            sizes="128px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest truncate mb-0.5">{p.brand || 'AURA'}</p>
                    <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs font-bold text-foreground">₹{p.price.toLocaleString()}</p>
                        {p.averageRating && (
                            <div className="flex items-center gap-0.5 text-[10px] text-amber-500">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                <span>{p.averageRating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                </button>
            ))}
        </div>
    );
}

export default function ProductCardWithRating({
    product,
    showReviewCount = true,
    showSimilarButton = true,
}: {
    product: Product;
    showReviewCount?: boolean;
    showSimilarButton?: boolean;
}) {
    const { user, updateUser } = useAuth();
    const [likesCount, setLikesCount] = useState(product.likesCount || 0);
    const [isLiking, setIsLiking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSimilar, setShowSimilar] = useState(false);
    const [activeProduct, setActiveProduct] = useState<Product>(product);

    // Get engagement status from global auth state
    const isLiked = user?.likedProducts?.includes(activeProduct._id) || false;
    const isSaved = user?.savedProducts?.includes(activeProduct._id) || false;

    const handleToggleLike = async (e: React.MouseEvent) => {
        if (!user) {
            toast.error('Sign in to like products');
            return;
        }

        e.preventDefault(); // Prevent Link navigation
        e.stopPropagation();
        setIsLiking(true);
        try {
            const res = await api.post<{ message: string; likesCount: number; isLiked: boolean }>(
                `/api/products/${activeProduct._id}/toggle-like`, {}
            );

            // Update global user state
            let newLikedProducts = [...(user.likedProducts || [])];
            if (res.isLiked) {
                if (!newLikedProducts.includes(activeProduct._id)) {
                    newLikedProducts.push(activeProduct._id);
                }
            } else {
                newLikedProducts = newLikedProducts.filter(id => id !== activeProduct._id);
            }

            updateUser({ likedProducts: newLikedProducts });
            setLikesCount(res.likesCount);

            toast.success(res.isLiked ? 'Added to favorites' : 'Removed from favorites');
        } catch (err: any) {
            console.error('Like error:', err);
            toast.error('Failed to like product');
        } finally {
            setIsLiking(false);
        }
    };

    const handleToggleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error('Please login to save products');
            return;
        }

        setIsSaving(true);
        try {
            const res = await api.post<{ isSaved: boolean }>(`/api/products/${activeProduct._id}/toggle-save`, {});

            // Update local user state
            const updatedSaved = res.isSaved
                ? [...(user.savedProducts || []), activeProduct._id]
                : (user.savedProducts || []).filter(id => id !== activeProduct._id);

            updateUser({ savedProducts: updatedSaved });
            toast.success(res.isSaved ? 'Product saved' : 'Removed from saves');
        } catch (err: any) {
            toast.error(err.message || 'Failed to save product');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="group relative flex flex-col h-full bg-background rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20">
            {/* Image Wrapper - Link to detail page */}
            <Link href={`/product/${activeProduct._id}`} className="relative block aspect-[3/4] overflow-hidden bg-secondary">
                <Image
                    src={activeProduct.imageUrl}
                    alt={activeProduct.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Floating Action Buttons */}
                <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
                    <button
                        onClick={handleToggleLike}
                        disabled={isLiking}
                        className={`p-2.5 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 active:scale-90 ${isLiked
                            ? 'bg-rose-500 text-white border-rose-400'
                            : 'bg-white/80 text-foreground border-white/50 hover:bg-white hover:text-rose-500'
                            } border`}
                        title={isLiked ? "Unlike" : "Like"}
                    >
                        {isLiking
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                        }
                    </button>
                    <button
                        onClick={handleToggleSave}
                        disabled={isSaving}
                        className={`p-2.5 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 active:scale-90 ${isSaved
                            ? 'bg-primary text-white border-primary/40'
                            : 'bg-white/80 text-foreground border-white/50 hover:bg-white hover:text-primary'
                            } border`}
                        title={isSaved ? "Unsave" : "Save"}
                    >
                        {isSaving
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                        }
                    </button>
                </div>
            </Link>

            {/* Info Section */}
            <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.15em]">
                            {activeProduct.brand || 'AURA'}
                        </p>
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-md border border-amber-100/50">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-[11px] font-bold">{activeProduct.averageRating ? activeProduct.averageRating.toFixed(1) : '4.5'}</span>
                        </div>
                    </div>

                    <Link href={`/product/${activeProduct._id}`} className="block group/link">
                        <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-1 group-hover/link:text-primary transition-colors">
                            {activeProduct.name}
                        </h3>
                    </Link>
                    <p className="text-[10px] text-muted-foreground truncate mt-1">
                        by <span className="font-semibold">{activeProduct.sellerId?.storeName || 'Aura Seller'}</span>
                    </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter block -mb-0.5">Price</span>
                        <p className="text-base font-black text-foreground tracking-tight">
                            ₹{activeProduct.price.toLocaleString()}
                        </p>
                    </div>
                    {showReviewCount && (
                        <p className="text-[10px] text-muted-foreground font-medium italic">
                            ({activeProduct.reviewCount || 12} reviews)
                        </p>
                    )}
                </div>
            </div>

            {/* See Similar toggle bar */}
            {showSimilarButton && (
                <>
                    <button
                        onClick={() => setShowSimilar(v => !v)}
                        className="w-full flex items-center justify-between px-4 py-2.5 border-t border-border/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all bg-muted/10"
                    >
                        <span className="flex items-center gap-2">
                            <ExternalLink className="w-3.5 h-3.5" />
                            See Similar
                        </span>
                        {showSimilar
                            ? <ChevronUp className="w-4 h-4" />
                            : <ChevronDown className="w-4 h-4" />
                        }
                    </button>

                    {/* Inline similar products area */}
                    {showSimilar && (
                        <div className="px-4 pb-4 pt-3 border-t border-border/30 bg-muted/5 animate-in slide-in-from-top-1 duration-300">
                            <SimilarProductsInline
                                productId={activeProduct._id}
                                onProductClick={(p) => {
                                    setActiveProduct(p as Product);
                                    setShowSimilar(false);
                                }}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
