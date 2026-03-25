'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    Heart,
    Loader2,
    Star,
    ShoppingCart,
    ChevronLeft,
    Share2,
    Bookmark,
    ShieldCheck,
    Palette,
    ArrowRight
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import ProductCardWithRating from '@/components/look/ProductCardWithRating';

interface Product {
    _id: string;
    imageUrl: string;
    brand: string;
    name: string;
    price: number;
    description?: string;
    productUrl?: string;
    category: string;
    likesCount?: number;
    savesCount?: number;
    viewsCount?: number;
    sharesCount?: number;
    images?: string[];
    averageRating?: number;
    reviewCount?: number;
    attributes?: {
        color?: string;
        size?: string[];
        material?: string;
    };
    sellerId?: {
        _id: string;
        name: string;
        storeName?: string;
    };
}

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, updateUser } = useAuth();

    const [product, setProduct] = useState<Product | null>(null);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLiking, setIsLiking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeImage, setActiveImage] = useState<string>('');

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [productData, similarData] = await Promise.all([
                    api.get<Product>(`/api/products/${id}`),
                    api.get<Product[]>(`/api/products/${id}/similar`)
                ]);

                setProduct(productData);
                setSimilarProducts(similarData || []);
                setActiveImage(productData.imageUrl);
            } catch (err: any) {
                console.error("Failed to load product:", err);
                toast.error("Product not found");
                router.push('/');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    const isLiked = user?.likedProducts?.includes(product?._id || '') || false;
    const isSaved = user?.savedProducts?.includes(product?._id || '') || false;

    const handleToggleLike = async () => {
        if (!user || !product) {
            toast.error('Sign in to like products');
            return;
        }

        setIsLiking(true);
        try {
            const res = await api.post<{ message: string; likesCount: number; isLiked: boolean }>(
                `/api/products/${product._id}/toggle-like`, {}
            );

            let newLikedProducts = [...(user.likedProducts || [])];
            if (res.isLiked) {
                if (!newLikedProducts.includes(product._id)) newLikedProducts.push(product._id);
            } else {
                newLikedProducts = newLikedProducts.filter(id => id !== product._id);
            }

            updateUser({ likedProducts: newLikedProducts });
            setProduct({ ...product, likesCount: res.likesCount });
            toast.success(res.isLiked ? 'Added to favorites' : 'Removed from favorites');
        } catch (err) {
            toast.error('Failed to update favorite');
        } finally {
            setIsLiking(false);
        }
    };

    const handleToggleSave = async () => {
        if (!user || !product) {
            toast.error('Sign in to save products');
            return;
        }

        setIsSaving(true);
        try {
            const res = await api.post<{ message: string; isSaved: boolean }>(
                `/api/products/${product._id}/toggle-save`, {}
            );

            let newSavedProducts = [...(user.savedProducts || [])];
            if (res.isSaved) {
                if (!newSavedProducts.includes(product._id)) newSavedProducts.push(product._id);
                toast.success("Product saved to your collection");
            } else {
                newSavedProducts = newSavedProducts.filter(id => id !== product._id);
                toast.success("Removed from saves");
            }

            updateUser({ savedProducts: newSavedProducts });
        } catch (err: any) {
            toast.error(err.message || 'Failed to update save status');
        } finally {
            setIsSaving(false);
        }
    };

    const handleBuyNow = () => {
        if (!product?.productUrl) {
            toast.error("Purchase link not available");
            return;
        }
        let url = product.productUrl.trim();
        if (!url.startsWith('http')) url = `https://${url}`;
        window.open(url, '_blank', 'noopener');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium animate-pulse">Loading product details...</p>
                </div>
            </div>
        );
    }

    if (!product) return null;

    const allImages = Array.from(new Set([product.imageUrl, ...(product.images || [])]));

    return (
        <div className="min-h-screen bg-background pb-20">
            <Navbar />

            {/* Breadcrumb */}
            <nav className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <ArrowRight className="w-3 h-3" />
                    <Link href={`/search?category=${product.category}`} className="hover:text-primary transition-colors">{product.category}</Link>
                    <ArrowRight className="w-3 h-3 text-primary/30" />
                    <span className="text-primary truncate max-w-[150px]">{product.name}</span>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

                    {/* Left: Gallery Section */}
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="flex md:flex-col gap-3 order-2 md:order-1 overflow-x-auto md:overflow-y-auto scrollbar-hide">
                                {allImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(img)}
                                        className={`relative w-16 h-20 md:w-20 md:h-28 rounded-xl overflow-hidden bg-muted shrink-0 transition-all ${activeImage === img ? 'ring-2 ring-primary ring-offset-2' : 'opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <Image src={img} alt={`${product.name} ${idx}`} fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Main Image */}
                        <div className="flex-1 order-1 md:order-2">
                            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-muted shadow-2xl shadow-primary/5 group">
                                <Image
                                    src={activeImage}
                                    alt={product.name}
                                    fill
                                    priority
                                    className="object-cover"
                                />
                                <button
                                    onClick={() => {
                                        // Track share on backend
                                        api.post(`/api/products/${product._id}/share`, {}).catch(console.error);

                                        if (navigator.share) {
                                            navigator.share({ title: product.name, url: window.location.href }).catch(() => {
                                                navigator.clipboard.writeText(window.location.href);
                                                toast.success("Link copied to clipboard");
                                            });
                                        } else {
                                            navigator.clipboard.writeText(window.location.href);
                                            toast.success("Link copied to clipboard");
                                        }
                                    }}
                                    className="absolute top-6 right-6 p-3 rounded-full bg-white/90 backdrop-blur-md shadow-lg hover:bg-white text-foreground hover:text-primary transition-all"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Info Section */}
                    <div className="flex flex-col pt-2 lg:pt-0">
                        {/* Header */}
                        <div className="mb-8">
                            <p className="text-primary text-sm font-black uppercase tracking-[0.3em] mb-2">
                                {product.brand || 'AURA'}
                            </p>
                            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground leading-tight tracking-tight mb-4">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100 shadow-sm">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="font-bold text-sm">{product.averageRating ? product.averageRating.toFixed(1) : '4.5'}</span>
                                    <span className="text-amber-400 mx-1">/</span>
                                    <span className="text-xs font-semibold">{product.reviewCount || '12'} Reviews</span>
                                </div>
                                <div className="text-muted-foreground text-xs font-medium flex items-center gap-1.5 uppercase tracking-wider">
                                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                    {product.likesCount || 0} Favorites
                                </div>
                            </div>
                        </div>

                        {/* Sold By */}
                        <div className="mb-8 flex items-center gap-3 p-4 bg-secondary/30 rounded-3xl border border-border/40">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Suggested by</p>
                                <Link href={`/creator/${product.sellerId?._id}`} className="font-serif font-bold text-lg text-foreground hover:text-primary transition-colors">
                                    {product.sellerId?.storeName || product.brand || 'Aura Seller'}
                                </Link>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="mb-8 p-6 bg-muted/30 rounded-3xl border border-border/60">
                            <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest block mb-1.5">Purchase Price</span>
                            <div className="flex items-end gap-2">
                                <p className="text-4xl font-black text-foreground tracking-tighter">
                                    ₹{product.price.toLocaleString()}
                                </p>
                                <span className="text-muted-foreground text-sm font-medium mb-1.5">Inc. all taxes</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mb-10">
                            <button
                                onClick={handleBuyNow}
                                className="flex-1 h-16 rounded-full bg-primary text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/25 hover:bg-primary/90 hover:-translate-y-1 active:translate-y-0 transition-all group"
                            >
                                <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                BUY NOW
                            </button>
                            <button
                                onClick={handleToggleLike}
                                disabled={isLiking}
                                className={`h-16 w-16 rounded-full flex items-center justify-center border-2 transition-all active:scale-90 ${isLiked
                                    ? 'bg-rose-50 border-rose-100 text-rose-500 shadow-lg shadow-rose-100'
                                    : 'bg-white border-border text-muted-foreground hover:border-rose-300 hover:text-rose-500'
                                    }`}
                                title={isLiked ? "Unlike" : "Like"}
                            >
                                {isLiking
                                    ? <Loader2 className="w-6 h-6 animate-spin" />
                                    : <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                                }
                            </button>
                            <button
                                onClick={handleToggleSave}
                                disabled={isSaving}
                                className={`h-16 w-16 rounded-full flex items-center justify-center border-2 transition-all active:scale-90 ${isSaved
                                    ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10'
                                    : 'bg-white border-border text-muted-foreground hover:border-primary/50 hover:text-primary'
                                    }`}
                                title={isSaved ? "Unsave" : "Save"}
                            >
                                {isSaving
                                    ? <Loader2 className="w-6 h-6 animate-spin" />
                                    : <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
                                }
                            </button>
                        </div>

                        {/* Description */}
                        <div className="mb-10 space-y-4">
                            <h3 className="font-bold text-lg text-foreground border-b border-border pb-2">Description</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {product.description || `Elevate your style with this ${product.name} from ${product.brand || 'Aura'}. Meticulously crafted with premium materials for both comfort and elegance.`}
                            </p>
                        </div>

                        {/* Studio CTA */}
                        <div className="pt-4">
                            <Link
                                href="/looks/create"
                                className="w-full h-16 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 flex items-center justify-center gap-3 group hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                            >
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Palette className="w-5 h-5" />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs font-bold uppercase tracking-wider text-foreground">Style in Studio</p>
                                    <p className="text-[11px] text-muted-foreground">Create a custom look with this item</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recommendations Section */}
                {similarProducts.length > 0 && (
                    <section className="mt-24">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-serif font-bold text-foreground">You May Also Like</h2>
                            <Link href={`/search?category=${product.category}`} className="text-primary font-bold text-sm hover:underline flex items-center gap-1.5">
                                View Collection <ChevronLeft className="w-4 h-4 rotate-180" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-6">
                            {similarProducts.slice(0, 5).map(p => (
                                <ProductCardWithRating key={p._id} product={p} showReviewCount={false} showSimilarButton={false} />
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
