'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Bookmark, Loader2, Star, ChevronRight, Share2, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
    _id: string;
    imageUrl: string;
    brand: string;
    name: string;
    price: number;
    description?: string;
    productUrl?: string;
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
    averageRating?: number;
}

export default function TaggedProductCard({ product }: { product: Product }) {
    const { user, updateUser } = useAuth();
    const [isLiking, setIsLiking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showSimilar, setShowSimilar] = useState(false);
    const [similarProducts, setSimilarProducts] = useState<SimilarProduct[]>([]);
    const [loadingSimilar, setLoadingSimilar] = useState(false);

    const isLiked = user?.likedProducts?.includes(product._id) || false;
    const isSaved = user?.savedProducts?.includes(product._id) || false;

    const handleToggleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return toast.error('Sign in to like products');

        setIsLiking(true);
        try {
            const res = await api.post<{ isLiked: boolean }>(`/api/products/${product._id}/toggle-like`, {});
            let newLiked = [...(user.likedProducts || [])];
            if (res.isLiked) newLiked.push(product._id);
            else newLiked = newLiked.filter(id => id !== product._id);
            updateUser({ likedProducts: newLiked });
        } catch (err) {
            toast.error('Failed to update like');
        } finally {
            setIsLiking(false);
        }
    };

    const handleToggleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return toast.error('Login to save products');

        setIsSaving(true);
        try {
            const res = await api.post<{ isSaved: boolean }>(`/api/products/${product._id}/toggle-save`, {});
            let newSaved = [...(user.savedProducts || [])];
            if (res.isSaved) newSaved.push(product._id);
            else newSaved = newSaved.filter(id => id !== product._id);
            updateUser({ savedProducts: newSaved });
            toast.success(res.isSaved ? 'Product saved' : 'Removed from saves');
        } catch (err) {
            toast.error('Failed to save product');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleSimilar = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!showSimilar && similarProducts.length === 0) {
            setLoadingSimilar(true);
            try {
                const data = await api.get<SimilarProduct[]>(`/api/products/${product._id}/similar`);
                setSimilarProducts(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingSimilar(false);
            }
        }
        setShowSimilar(!showSimilar);
    };

    return (
        <div className="group bg-background rounded-2xl border border-border/60 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden">
            <Link href={`/product/${product._id}`} className="flex p-3 gap-4 items-center">
                {/* Thumbnail */}
                <div className="relative w-20 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-muted shadow-inner">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="80px"
                    />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 py-1">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest truncate">
                            {product.brand || 'AURA'}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold border border-amber-100/50">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            {product.averageRating?.toFixed(1) || '4.5'}
                        </div>
                    </div>
                    <h3 className="text-sm font-bold text-foreground leading-snug truncate mb-1">
                        {product.name}
                    </h3>
                    <p className="text-[10px] text-muted-foreground truncate mb-2">
                        by <span className="font-semibold">{product.sellerId?.storeName || product.brand || 'Aura Seller'}</span>
                    </p>
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-black text-foreground">₹{product.price.toLocaleString()}</p>
                        <div className="flex items-center gap-1.5">
                            <button onClick={handleToggleLike} className={`p-1.5 rounded-full transition-colors ${isLiked ? 'text-rose-500 bg-rose-50' : 'text-muted-foreground hover:bg-muted'}`}>
                                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                            </button>
                            <button onClick={handleToggleSave} className={`p-1.5 rounded-full transition-colors ${isSaved ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'}`}>
                                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Footer Actions */}
            <div className="flex border-t border-border/40">
                <button
                    onClick={toggleSimilar}
                    className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-muted/30 transition-all flex items-center justify-center gap-1.5"
                >
                    {loadingSimilar ? <Loader2 className="w-3 h-3 animate-spin" /> : 'See Similar'}
                    <ChevronRight className={`w-3 h-3 transition-transform duration-300 ${showSimilar ? 'rotate-90' : ''}`} />
                </button>
                <div className="w-px bg-border/40 h-auto" />
                <Link
                    href={`/product/${product._id}`}
                    className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-muted/30 transition-all flex items-center justify-center gap-1.5 border-l border-border/40"
                >
                    View Details
                    <ExternalLink className="w-3 h-3" />
                </Link>
            </div>

            {/* Similar Products Horizontal Scroll */}
            <AnimatePresence>
                {showSimilar && similarProducts.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-muted/20 border-t border-border/40"
                    >
                        <div className="p-3">
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                                {similarProducts.map(p => (
                                    <Link key={p._id} href={`/product/${p._id}`} className="snap-start flex-shrink-0 w-24 group/item">
                                        <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-1 ring-1 ring-border group-hover/item:ring-primary/40 transition-all">
                                            <Image src={p.imageUrl} alt={p.name} fill className="object-cover" sizes="96px" />
                                        </div>
                                        <p className="text-[9px] font-bold text-foreground truncate">{p.name}</p>
                                        <p className="text-[9px] font-black text-primary">₹{p.price}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
