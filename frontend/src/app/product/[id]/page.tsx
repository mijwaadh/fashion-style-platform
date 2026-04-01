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
    ArrowRight,
    X
} from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/layout/Navbar';
import ProductCardWithRating from '@/components/look/ProductCardWithRating';

interface Product {
    _id: string;
    imageUrl: string;
    brand: string;
    name: string;
    price: number;
    salePrice?: number;
    discountPercentage?: number;
    description?: string;
    productUrl?: string;
    category: string;
    subCategory?: string;
    productType?: string;
    likesCount?: number;
    savesCount?: number;
    viewsCount?: number;
    sharesCount?: number;
    images?: string[];
    averageRating?: number;
    reviewCount?: number;
    attributes?: {
        colors?: string[];
        size?: string[];
        material?: string;
    };
    specifications?: {
        weight_gms?: number;
        supplier_id?: string;
        fabric?: string;
        fit?: string;
        neck?: string;
        occasion?: string;
        pattern?: string;
        sleeve_length?: string;
        country_of_origin?: string;
        manufacturer_name?: string;
        manufacturer_address?: string;
        manufacturer_pincode?: number;
        packer_name?: string;
        packer_address?: string;
        packer_pincode?: number;
        importer_name?: string;
        importer_address?: string;
        importer_pincode?: number;
    };
    ownerId?: {
        _id: string;
        name: string;
        storeName?: string;
    };
    listingType?: 'native' | 'affiliate';
}

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, updateUser } = useAuth();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLiking, setIsLiking] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeImage, setActiveImage] = useState<string>('');
    const [addingToCart, setAddingToCart] = useState(false);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [sizeUnit, setSizeUnit] = useState<'in' | 'cm'>('in');

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
                
                const sizes = productData.attributes?.size && productData.attributes.size.length > 0 
                    ? productData.attributes.size 
                    : ['Free Size'];

                // Auto-select size if only one available (including fallback)
                if (sizes.length === 1) {
                    setSelectedSize(sizes[0]);
                }
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

    // Size Guide Data & Helpers
    const formatValue = (inches: number) => {
        if (sizeUnit === 'in') return inches.toString();
        // Standard Inch to CM conversion: 1" = 2.54cm
        return (Math.round(inches * 2.54 * 100) / 100).toLocaleString();
    };

    const KURTA_MEASUREMENTS = {
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
        bust: [34, 36, 38, 40, 42, 44, 46],
        waist: [32, 34, 36, 38, 40, 42, 44],
        armhole: [15, 16, 17, 17, 19, 19, 21],
        shoulder: [13, 13.5, 14, 14.5, 15, 15, 16],
    };

    const BOTTOM_MEASUREMENTS = {
        waist: [29, 29, 31, 31, 33, 33, 35],
        hip: [40, 42, 44, 46, 48, 50, 52],
        flare: [6, 6.5, 6.5, 7, 7, 7.5, 7.5],
        thigh: [26, 27, 28, 29, 30, 31, 32],
    };

    const isEthnicWear = product && [
        product.category, 
        product.subCategory, 
        product.productType, 
        product.name
    ].some(str => str && ['kurta', 'kurti', 'ethnic', 'anarkali', 'set'].some(key => str.toLowerCase().includes(key)));

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

    const handleBuyNow = async () => {
        if (product?.listingType === 'native') {
            if (!user) {
                toast.error("Please sign in to add items to your bag");
                return;
            }

            // Size Validation
            if (product.attributes?.size && product.attributes.size.length > 0 && !selectedSize) {
                toast.error("Please select a size first");
                return;
            }

            setAddingToCart(true);
            try {
                await addToCart(product._id, 1, selectedSize);
            } catch (err: any) {
                toast.error(err.message || "Failed to add to bag");
            } finally {
                setAddingToCart(false);
            }
            return;
        }

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
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-primary text-xs font-black uppercase tracking-[0.3em]">
                                    {product.brand || 'AURA'}
                                </p>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100/50">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span className="font-bold text-[10px] tracking-tight">{product.averageRating ? product.averageRating.toFixed(1) : '4.5'}</span>
                                </div>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground leading-tight tracking-tight mb-4">
                                {product.name}
                            </h1>
                        </div>

                        {/* Price & Discount */}
                        <div className="mb-6 p-5 bg-muted/20 rounded-3xl border border-border/40">
                            <div className="flex items-end gap-3">
                                <p className="text-3xl font-black text-emerald-600 tracking-tighter">
                                    ₹{(product.salePrice || product.price).toLocaleString()}
                                </p>
                                {product.salePrice && product.salePrice < product.price && (
                                    <p className="text-lg text-muted-foreground line-through font-medium mb-0.5 decoration-muted-foreground/30">
                                        ₹{product.price.toLocaleString()}
                                    </p>
                                )}
                                {product.salePrice && product.salePrice < product.price && (
                                    <span className="ml-auto text-emerald-600 text-xs font-black bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                                        {product.discountPercentage}% OFF
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Size Selection - MANDATORY */}
                        <div className="mb-8 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                                    Select Size <span className="text-primary font-black animate-pulse">•</span>
                                </h3>
                                {isEthnicWear && (
                                    <button 
                                        onClick={() => setShowSizeGuide(true)}
                                        className="text-[10px] font-bold text-primary uppercase hover:underline"
                                    >
                                        Size Guide
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                {(product.attributes?.size && product.attributes.size.length > 0 ? product.attributes.size : ['Free Size']).map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`min-w-[54px] h-[54px] rounded-2xl border-2 font-black text-sm transition-all flex items-center justify-center ${
                                            selectedSize === size
                                            ? 'border-primary bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                                            : 'border-border bg-white text-muted-foreground hover:border-primary/50 hover:text-primary'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 mb-8">
                            <button
                                onClick={handleBuyNow}
                                disabled={addingToCart}
                                className="flex-1 h-16 rounded-full bg-primary text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-primary/25 hover:bg-primary/90 hover:-translate-y-1 active:translate-y-0 transition-all group disabled:opacity-70"
                            >
                                {addingToCart ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />}
                                {product.listingType === 'native' ? (addingToCart ? 'ADDING...' : 'ADD TO BAG') : 'BUY NOW'}
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

                        {/* Sold By / Attribution */}
                        <div className="mb-10 flex items-center gap-3 p-4 bg-secondary/20 rounded-3xl border border-border/40 hover:bg-secondary/30 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Suggested by</p>
                                <Link href={`/creator/${product.ownerId?._id}`} className="font-serif font-bold text-lg text-foreground hover:text-primary transition-colors">
                                    {product.ownerId?.storeName || product.ownerId?.name || 'Aura Seller'}
                                </Link>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-10 space-y-4">
                            <div className="flex items-center gap-2 border-b border-border pb-2">
                                <h3 className="font-bold text-lg text-foreground">Product Description</h3>
                            </div>
                            <p className="text-muted-foreground leading-relaxed text-sm">
                                {product.description || `Elevate your style with this ${product.name} from ${product.brand || 'Aura'}. Meticulously crafted with premium materials for both comfort and elegance.`}
                            </p>
                        </div>

                        {/* Specifications */}
                        {product.specifications && (
                            <div className="mb-10 space-y-4">
                                <h3 className="font-bold text-lg text-foreground border-b border-border pb-2">Product Specifications</h3>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                                    {product.specifications.fabric && (
                                        <div className="flex flex-col border-b border-border/30 pb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fabric</span>
                                            <span className="text-sm font-bold text-foreground">{product.specifications.fabric}</span>
                                        </div>
                                    )}
                                    {product.specifications.fit && (
                                        <div className="flex flex-col border-b border-border/30 pb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fit / Shape</span>
                                            <span className="text-sm font-bold text-foreground">{product.specifications.fit}</span>
                                        </div>
                                    )}
                                    {product.specifications.neck && (
                                        <div className="flex flex-col border-b border-border/30 pb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Neck Line</span>
                                            <span className="text-sm font-bold text-foreground">{product.specifications.neck}</span>
                                        </div>
                                    )}
                                    {product.specifications.occasion && (
                                        <div className="flex flex-col border-b border-border/30 pb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Occasion</span>
                                            <span className="text-sm font-bold text-foreground">{product.specifications.occasion}</span>
                                        </div>
                                    )}
                                    {product.specifications.pattern && (
                                        <div className="flex flex-col border-b border-border/30 pb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pattern</span>
                                            <span className="text-sm font-bold text-foreground">{product.specifications.pattern}</span>
                                        </div>
                                    )}
                                    {product.specifications.sleeve_length && (
                                        <div className="flex flex-col border-b border-border/30 pb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sleeves</span>
                                            <span className="text-sm font-bold text-foreground">{product.specifications.sleeve_length}</span>
                                        </div>
                                    )}
                                    {product.specifications.weight_gms && (
                                        <div className="flex flex-col border-b border-border/30 pb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Net Weight</span>
                                            <span className="text-sm font-bold text-foreground">{product.specifications.weight_gms} gms</span>
                                        </div>
                                    )}
                                    {product.specifications.country_of_origin && (
                                        <div className="flex flex-col border-b border-border/30 pb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Country of Origin</span>
                                            <span className="text-sm font-bold text-foreground">{product.specifications.country_of_origin}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Manufacturing Accordion Style */}
                                {(product.specifications.manufacturer_name || product.specifications.packer_name || product.specifications.importer_name) && (
                                    <div className="mt-6 p-4 bg-muted/20 rounded-2xl border border-border/40 space-y-4">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">Manufacturing & Compliance</h4>
                                        
                                        {product.specifications.manufacturer_name && (
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Manufacturer Details</p>
                                                <p className="text-xs font-semibold leading-relaxed">
                                                    {product.specifications.manufacturer_name}
                                                    {product.specifications.manufacturer_address && <>, {product.specifications.manufacturer_address}</>}
                                                    {product.specifications.manufacturer_pincode && <> - {product.specifications.manufacturer_pincode}</>}
                                                </p>
                                            </div>
                                        )}

                                        {product.specifications.packer_name && (
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Packer Details</p>
                                                <p className="text-xs font-semibold leading-relaxed">
                                                    {product.specifications.packer_name}
                                                    {product.specifications.packer_address && <>, {product.specifications.packer_address}</>}
                                                    {product.specifications.packer_pincode && <> - {product.specifications.packer_pincode}</>}
                                                </p>
                                            </div>
                                        )}

                                        {product.specifications.importer_name && (
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Importer Details</p>
                                                <p className="text-xs font-semibold leading-relaxed">
                                                    {product.specifications.importer_name}
                                                    {product.specifications.importer_address && <>, {product.specifications.importer_address}</>}
                                                    {product.specifications.importer_pincode && <> - {product.specifications.importer_pincode}</>}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

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
            {/* Size Guide Modal */}
            {showSizeGuide && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-all duration-300">
                    <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border/40">
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-foreground">Size Guide</h2>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Kurta Set Measurement Chart</p>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                {/* Enhanced Toggle */}
                                <div className="flex bg-muted/30 p-1 rounded-full border border-border/40 backdrop-blur-sm self-center">
                                    <button
                                        onClick={() => setSizeUnit('in')}
                                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${sizeUnit === 'in' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        IN
                                    </button>
                                    <button
                                        onClick={() => setSizeUnit('cm')}
                                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${sizeUnit === 'cm' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        CM
                                    </button>
                                </div>
                                
                                <button 
                                    onClick={() => setShowSizeGuide(false)}
                                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border/60"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-10 custom-scrollbar">
                            {/* Kurta Table */}
                            <section>
                                <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-4 border-l-4 border-primary pl-3 flex items-center justify-between">
                                    Kurta Measurements
                                    <span className="text-[10px] font-medium text-muted-foreground tracking-normal lowercase italic bg-muted px-2 py-0.5 rounded-md">in {sizeUnit === 'in' ? 'inches' : 'centimeters'}</span>
                                </h3>
                                <div className="overflow-x-auto rounded-2xl border border-border/60 shadow-sm">
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="bg-muted/30 border-b border-border/60 font-serif">
                                                <th className="px-4 py-4 font-bold text-foreground uppercase tracking-wider text-[10px]">Size</th>
                                                {KURTA_MEASUREMENTS.sizes.map(size => (
                                                    <th key={size} className="px-4 py-4 font-bold text-foreground uppercase tracking-wider text-[10px]">{size}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/40 font-medium">
                                            <tr><td className="px-4 py-3 font-bold bg-muted/10 text-[11px] uppercase tracking-tighter">Bust</td>{KURTA_MEASUREMENTS.bust.map((v, i) => <td key={i} className="px-4 py-3">{formatValue(v)}</td>)}</tr>
                                            <tr><td className="px-4 py-3 font-bold bg-muted/10 text-[11px] uppercase tracking-tighter">Waist</td>{KURTA_MEASUREMENTS.waist.map((v, i) => <td key={i} className="px-4 py-3">{formatValue(v)}</td>)}</tr>
                                            <tr><td className="px-4 py-3 font-bold bg-muted/10 text-[11px] uppercase tracking-tighter">Armhole</td>{KURTA_MEASUREMENTS.armhole.map((v, i) => <td key={i} className="px-4 py-3">{formatValue(v)}</td>)}</tr>
                                            <tr><td className="px-4 py-3 font-bold bg-muted/10 text-[11px] uppercase tracking-tighter">Shoulder</td>{KURTA_MEASUREMENTS.shoulder.map((v, i) => <td key={i} className="px-4 py-3">{formatValue(v)}</td>)}</tr>
                                            <tr><td className="px-4 py-3 font-bold bg-muted/10 text-[11px] uppercase tracking-tighter">Length</td><td colSpan={7} className="px-4 py-3 text-center italic font-medium">{sizeUnit === 'in' ? '44 to 45' : '111 to 114'} Approx</td></tr>
                                            <tr><td className="px-4 py-3 font-bold bg-muted/10 text-[11px] uppercase tracking-tighter">Sleeve</td><td colSpan={7} className="px-4 py-3 text-center italic font-medium">{sizeUnit === 'in' ? '16 to 17' : '40.6 to 43.1'} Approx</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* Bottom Table */}
                            <section>
                                <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-4 border-l-4 border-primary pl-3 flex items-center justify-between">
                                    Bottom Measurements
                                    <span className="text-[10px] font-medium text-muted-foreground tracking-normal lowercase italic bg-muted px-2 py-0.5 rounded-md">in {sizeUnit === 'in' ? 'inches' : 'centimeters'}</span>
                                </h3>
                                <div className="overflow-x-auto rounded-2xl border border-border/60 shadow-sm">
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr className="bg-muted/30 border-b border-border/60 font-serif">
                                                <th className="px-4 py-4 font-bold text-foreground uppercase tracking-wider text-[10px]">Size</th>
                                                {KURTA_MEASUREMENTS.sizes.map(size => (
                                                    <th key={size} className="px-4 py-4 font-bold text-foreground uppercase tracking-wider text-[10px]">{size}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/40 font-medium">
                                            <tr><td className="px-4 py-3 font-bold bg-muted/10 text-[11px] uppercase tracking-tighter">Waist</td>{BOTTOM_MEASUREMENTS.waist.map((v, i) => <td key={i} className="px-4 py-3">{formatValue(v)}</td>)}</tr>
                                            <tr><td className="px-4 py-3 font-bold bg-muted/10 text-[11px] uppercase tracking-tighter">Hip</td>{BOTTOM_MEASUREMENTS.hip.map((v, i) => <td key={i} className="px-4 py-3">{formatValue(v)}</td>)}</tr>
                                            <tr><td className="px-4 py-3 font-bold bg-muted/10 text-[11px] uppercase tracking-tighter">Flare/Moli</td>{BOTTOM_MEASUREMENTS.flare.map((v, i) => <td key={i} className="px-4 py-3">{formatValue(v)}</td>)}</tr>
                                            <tr><td className="px-4 py-3 font-bold bg-muted/10 text-[11px] uppercase tracking-tighter">Length</td><td colSpan={7} className="px-4 py-3 text-center italic font-medium">{sizeUnit === 'in' ? '38' : '96.5'} Approx</td></tr>
                                            <tr><td className="px-4 py-3 font-bold bg-muted/10 text-[11px] uppercase tracking-tighter">Thigh</td>{BOTTOM_MEASUREMENTS.thigh.map((v, i) => <td key={i} className="px-4 py-3">{formatValue(v)}</td>)}</tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            {/* Dupatta Section */}
                            <section className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                                <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em] mb-4">Dupatta</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-foreground uppercase tracking-wider">Length</span>
                                    <span className="text-sm font-serif font-bold text-primary bg-white px-4 py-1.5 rounded-full border border-primary/20 shadow-sm tracking-wide">
                                        {sizeUnit === 'in' ? '2.2 Yards Approx.' : '200 CM Approx.'}
                                    </span>
                                </div>
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-muted/20 border-t border-border/40 text-center">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">All dimensions are in {sizeUnit === 'in' ? 'inches' : 'centimeters'}. Values are rounded for clarity.</p>
                        </div>
                    </div>
                </div>
            )}
            </main>
        </div>
    );
}
