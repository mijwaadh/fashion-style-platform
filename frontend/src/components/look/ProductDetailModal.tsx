'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShoppingCart, Heart, X, ExternalLink, Info, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import SimilarProductSuggestions from './SimilarProductSuggestions';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';

interface Product {
    _id: string;
    imageUrl: string;
    images?: string[];
    brand: string;
    name: string;
    price: number;
    description?: string;
    productUrl?: string;
    productType?: string;
    likesCount?: number;
    likes?: string[];
}

interface ProductDetailModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    onToggleLike?: (isLiked: boolean, count: number) => void;
}

export default function ProductDetailModal({
    product,
    isOpen,
    onClose,
    onToggleLike
}: ProductDetailModalProps) {
    const { user, updateUser } = useAuth();
    const [activeProduct, setActiveProduct] = useState<Product>(product);
    const [likesCount, setLikesCount] = useState(product.likesCount || 0);
    const [isLiking, setIsLiking] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Get liked status from global auth state
    const isLiked = user?.likedProducts?.includes(activeProduct._id) || false;

    // Get array of images to display. Fallback to just the main imageUrl if empty.
    const displayImages = activeProduct.images && activeProduct.images.length > 0
        ? activeProduct.images
        : [activeProduct.imageUrl];

    // Sync state when the initial product prop changes (e.g., opening modal from a different card)
    useEffect(() => {
        setActiveProduct(product);
        setLikesCount(product.likesCount || 0);
        setCurrentImageIndex(0); // Reset carousel on product change
    }, [product]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    const handleToggleLike = async (e: React.MouseEvent) => {
        if (!user) {
            toast.error('Connect to like products');
            return;
        }

        e.stopPropagation();
        setIsLiking(true);
        try {
            const res = await api.post<{ message: string; likesCount: number; isLiked: boolean }>(
                `/api/products/${activeProduct._id}/toggle-like`,
                {}
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

            // Only notify parent if we're liking the original product that opened the modal
            if (onToggleLike && activeProduct._id === product._id) {
                onToggleLike(res.isLiked, res.likesCount);
            }

            toast.success(res.isLiked ? 'Added to favorites' : 'Removed from favorites');
        } catch (err: any) {
            console.error('Failed to like product', err);
            const msg = err.message || '';
            if (msg.includes('401') || msg.toLowerCase().includes('authorized')) {
                toast.error('Connect to like products');
            } else {
                toast.error(`Error: ${msg || 'Failed to like product'}`);
            }
        } finally {
            setIsLiking(false);
        }
    };

    const handleBuyNow = () => {
        const finalUrl = activeProduct.productUrl || (activeProduct as any).url;
        if (!finalUrl) {
            toast.error('Affiliate link not available');
            return;
        }

        let absoluteUrl = finalUrl.trim();
        if (absoluteUrl.startsWith('http://')) {
            absoluteUrl = absoluteUrl.replace('http://', 'https://');
        } else if (!absoluteUrl.startsWith('https://')) {
            absoluteUrl = `https://${absoluteUrl}`;
        }
        window.open(absoluteUrl, '_blank', 'noopener');
    };

    const nextImage = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
    };

    const prevImage = (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="bg-background w-full max-w-4xl max-h-[90vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-background/80 backdrop-blur-sm rounded-full border border-border hover:bg-muted transition-colors shadow-sm"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left: Image Carousel Section */}
                <div className="md:w-1/2 relative aspect-square md:aspect-auto bg-muted group">
                    <img
                        src={displayImages[currentImageIndex]}
                        alt={`${activeProduct.name} - View ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover transition-opacity duration-300"
                    />

                    {/* Carousel Controls - Only show if multiple images exist */}
                    {displayImages.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-105 shadow-md text-foreground z-10"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-105 shadow-md text-foreground z-10"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                            </button>

                            {/* Dot Indicators */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                                {displayImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                        className={`h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-6 bg-primary' : 'w-2 bg-white/60 hover:bg-white'} shadow-sm`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Right: Info Section */}
                <div
                    id="product-info-scroll"
                    className="md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col custom-scrollbar"
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-primary uppercase tracking-widest">{activeProduct.brand || 'Aura Selection'}</p>
                            <button
                                onClick={handleToggleLike}
                                disabled={isLiking}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all text-sm font-bold shadow-sm border ${isLiked
                                    ? 'bg-rose-50 border-rose-100 text-rose-500'
                                    : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                                    }`}
                            >
                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                <span>{likesCount}</span>
                            </button>
                        </div>

                        <h2 className="text-3xl font-serif font-bold text-foreground leading-tight">{activeProduct.name}</h2>
                        <p className="text-2xl font-bold text-emerald-600">₹{activeProduct.price.toLocaleString()}</p>

                        <div className="py-4 border-t border-b border-border space-y-3">
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Info className="w-3.5 h-3.5" />
                                Description
                            </h3>
                            <p className="text-muted-foreground leading-relaxed text-sm">
                                {activeProduct.description || "Looking for a refined style? This carefully curated piece from Aura's collection combines premium materials with timeless design. Perfect for elevating your daily aesthetic or making a statement at your next event."}
                            </p>
                        </div>

                        {/* CTA Section */}
                        <div className="pt-4 flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={handleBuyNow}
                                className="flex-1 h-14 rounded-full text-lg font-bold gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Buy Now
                            </Button>
                            <Button
                                variant="outline"
                                className="h-14 w-14 rounded-full p-0 border-border shrink-0"
                                onClick={() => window.open(activeProduct.productUrl, '_blank')}
                                title="Visit Store"
                            >
                                <ExternalLink className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Similar Products */}
                        <div className="pt-8 bg-muted/5 -mx-8 px-8 pb-4">
                            <SimilarProductSuggestions
                                productId={activeProduct._id}
                                productType={activeProduct.productType || 'item'}
                                onProductClick={(newProduct) => {
                                    setActiveProduct(newProduct as any);
                                    setLikesCount((newProduct as any).likesCount || 0);

                                    // Scroll back to top
                                    const scrollDiv = document.getElementById('product-info-scroll');
                                    if (scrollDiv) scrollDiv.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
