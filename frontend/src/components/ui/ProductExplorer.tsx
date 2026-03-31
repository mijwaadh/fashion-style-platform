'use client';

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/lib/api';
import { 
    Loader2, FilterX, ChevronRight, ChevronDown, 
    Layers, ShoppingBag, SlidersHorizontal, X 
} from 'lucide-react';
import ProductCardWithRating from '@/components/look/ProductCardWithRating';
import { Button } from './button';
import { Badge } from './badge';

interface Product {
    _id: string;
    imageUrl: string;
    brand: string;
    name: string;
    price: number;
    category: string;
    averageRating?: number;
    reviewCount?: number;
    productUrl?: string;
}

const TAXONOMY: any = {
    "MEN FASHION": {
        "Men Clothing": {
            "Men Top Wear": ["T-Shirts", "Shirts", "Personalized T-Shirts", "Jumpsuits", "Swim Suits", "Top & Bottom Sets"],
            "Men Bottom Wear": ["Jeans", "Shorts", "Track Pants", "Trousers", "Three Fourths", "Dungarees", "Swimming Shorts", "Top & Bottom Sets", "Suit Sets"]
        },
        "Men Ethnic Wear": {
            "Traditional": ["Dhoti / Mundu / Lungi", "Ethnic Jackets", "Kurta Sets", "Kurtas", "Sherwanis"]
        },
        "Men Sportswear": {
            "Activewear": ["Active Shorts", "Gym Vest", "Tracksuits"]
        },
        "Men Winter Wear": {
            "Outerwear": ["Blazers", "Jackets", "Sweaters", "Sweatshirts", "Shrugs"]
        },
        "Men FOOTWEAR": {
            "Shoes": ["Casual Shoes", "Formal Shoes", "Sports Shoes", "Sneakers", "Loafers", "Boots"],
            "Flip Flops & Sandals": ["Flip Flops", "Sliders", "Clogs", "Sandals"]
        }
    },
    "WOMEN FASHION": {
        "Ethnic Wear": {
            "Kurtis & Sets": ["Kurtis", "Kurti Fabrics", "Kurti With Dupatta"],
            "Sarees & Blouses": ["Blouses", "Sarees With Stitched Blouse"],
            "Lehenga Choli": ["Lehenga", "Ready To Wear Lehenga"]
        },
        "WOMEN FOOTWEAR": {
            "Flats": ["Flats", "Platforms"],
            "Heels": ["Stilettos", "Pumps"],
            "Shoes": ["Formal Shoes", "Casual Shoes", "Sports Shoes"]
        },
        "WOMEN SPORTS & ACTIVEWEAR": {
            "Sportswear": ["Swimwear", "Active Tank Top", "Tracksuits"],
            "Activewear": ["Active Bottomwear", "Active Topwear"]
        }
    }
};

export default function ProductExplorer() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [mainCategory, setMainCategory] = useState<string>('');
    const [category, setCategory] = useState<string>('');
    const [subCategory, setSubCategory] = useState<string>('');
    const [productType, setProductType] = useState<string>('');
    
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');

    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Accordion state
    const [expandedMain, setExpandedMain] = useState<string | null>("MEN FASHION");
    const [expandedCat, setExpandedCat] = useState<string | null>(null);

    // Debounce state for fetching
    const [debouncedMin, setDebouncedMin] = useState<string>(minPrice);
    const [debouncedMax, setDebouncedMax] = useState<string>(maxPrice);

    // Handle debouncing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedMin(minPrice);
            setDebouncedMax(maxPrice);
        }, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [minPrice, maxPrice]);

    // Fetch products whenever filters change
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (mainCategory) params.append('mainCategory', mainCategory);
                if (category) params.append('category', category);
                if (subCategory) params.append('subCategory', subCategory);
                if (productType) params.append('productType', productType);
                if (debouncedMin) params.append('minPrice', debouncedMin);
                if (debouncedMax) params.append('maxPrice', debouncedMax);

                const data = await api.get<Product[]>(`/api/products?${params.toString()}`);
                setProducts(data);
            } catch (err) {
                console.error("Failed to load products:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [mainCategory, category, subCategory, productType, debouncedMin, debouncedMax]);

    const clearFilters = () => {
        setMainCategory('');
        setCategory('');
        setSubCategory('');
        setProductType('');
        setMinPrice('');
        setMaxPrice('');
    };

    const isFiltered = mainCategory || category || subCategory || productType || minPrice || maxPrice;

    const SidebarContent = () => (
        <div className="space-y-8 pr-2">
            {/* Hierarchy */}
            <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" /> Categories
                </h3>
                <div className="space-y-2">
                    {Object.keys(TAXONOMY).map(mCat => (
                        <div key={mCat} className="space-y-1">
                            <button
                                onClick={() => setExpandedMain(expandedMain === mCat ? null : mCat)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                                    mainCategory === mCat ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-foreground'
                                }`}
                            >
                                <span className="truncate">{mCat}</span>
                                {expandedMain === mCat ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            
                            {expandedMain === mCat && (
                                <div className="ml-2 pl-2 border-l border-border space-y-1 mt-1 animate-in slide-in-from-left-2 duration-200">
                                    <button 
                                        onClick={() => { setMainCategory(mCat); setCategory(''); setSubCategory(''); setProductType(''); }}
                                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                            mainCategory === mCat && !category ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        All {mCat}
                                    </button>
                                    {Object.keys(TAXONOMY[mCat]).map(cat => (
                                        <div key={cat} className="space-y-1">
                                            <button
                                                onClick={() => {
                                                    setMainCategory(mCat);
                                                    setExpandedCat(expandedCat === cat ? null : cat);
                                                }}
                                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                    category === cat ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                            >
                                                <span>{cat}</span>
                                                {expandedCat === cat ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                            </button>
                                            
                                            {expandedCat === cat && (
                                                <div className="ml-2 pl-2 border-l border-border/50 space-y-1 animate-in slide-in-from-left-1">
                                                    <button 
                                                        onClick={() => { setMainCategory(mCat); setCategory(cat); setSubCategory(''); setProductType(''); }}
                                                        className={`w-full text-left px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                                                            category === cat && !subCategory ? 'text-primary' : 'text-muted-foreground/80 hover:text-foreground'
                                                        }`}
                                                    >
                                                        All {cat}
                                                    </button>
                                                    {Object.keys(TAXONOMY[mCat][cat]).map(sCat => (
                                                        <button 
                                                            key={sCat}
                                                            onClick={() => {
                                                                setMainCategory(mCat);
                                                                setCategory(cat);
                                                                setSubCategory(sCat);
                                                                setProductType('');
                                                            }}
                                                            className={`w-full text-left px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                                                                subCategory === sCat ? 'text-primary font-bold' : 'text-muted-foreground/80 hover:text-foreground'
                                                            }`}
                                                        >
                                                            {sCat}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Price Range (₹)</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground ml-1">Min</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground ml-1">Max</label>
                            <input
                                type="number"
                                placeholder="50000"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Clear All */}
            {isFiltered && (
                <Button 
                    variant="outline" 
                    onClick={clearFilters} 
                    className="w-full rounded-xl gap-2 text-xs h-10 border-dashed hover:border-destructive hover:text-destructive"
                >
                    <FilterX className="w-3.5 h-3.5" /> Clear All Filters
                </Button>
            )}
        </div>
    );

    return (
        <section className="py-12 bg-background border-t border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Mobile Filter Trigger */}
                <div className="md:hidden flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-serif font-bold">Explore Products</h2>
                    <Button 
                        variant="secondary" 
                        onClick={() => setIsMobileFiltersOpen(true)}
                        className="rounded-full gap-2 text-xs"
                    >
                        <SlidersHorizontal className="w-4 h-4" /> Filters
                    </Button>
                </div>

                <div className="flex flex-col md:flex-row gap-10 items-start">
                    
                    {/* Desktop Sidebar */}
                    <aside className="hidden md:block w-64 shrink-0 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 scrollbar-hide">
                        <SidebarContent />
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 w-full space-y-8">
                        <div className="hidden md:block">
                            <h2 className="text-4xl font-serif font-bold text-foreground tracking-tight">Explore Products</h2>
                            <p className="text-muted-foreground mt-2 font-medium">Shop curated pieces from our stylists and creators.</p>
                        </div>

                        {/* Active Filter Badges */}
                        {isFiltered && (
                            <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                                {mainCategory && (
                                    <Badge variant="secondary" className="gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-primary/5 border-primary/20 text-primary">
                                        {mainCategory} <X className="w-3 h-3 cursor-pointer" onClick={() => setMainCategory('')} />
                                    </Badge>
                                )}
                                {category && (
                                    <Badge variant="secondary" className="gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-primary/5 border-primary/20 text-primary">
                                        {category} <X className="w-3 h-3 cursor-pointer" onClick={() => setCategory('')} />
                                    </Badge>
                                )}
                                {subCategory && (
                                    <Badge variant="secondary" className="gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-primary/5 border-primary/20 text-primary">
                                        {subCategory} <X className="w-3 h-3 cursor-pointer" onClick={() => setSubCategory('')} />
                                    </Badge>
                                )}
                            </div>
                        )}

                        {/* Grid */}
                        {isLoading ? (
                            <div className="flex justify-center py-32">
                                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                            </div>
                        ) : products.length === 0 ? (
                            <div className="py-32 text-center bg-muted/10 border-2 border-dashed border-border rounded-3xl">
                                <div className="p-4 bg-background rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-border">
                                    <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">No Products Found</h3>
                                <p className="text-muted-foreground mt-1 max-w-xs mx-auto">We couldn't find any items matching your current filters. Try diversifying your search.</p>
                                <Button onClick={clearFilters} variant="outline" className="mt-6 rounded-full px-8">
                                    Reset Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
                                {products.map(product => (
                                    <ProductCardWithRating
                                        key={product._id}
                                        product={product}
                                        showReviewCount={false}
                                        showSimilarButton={false}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters Drawer */}
            {isMobileFiltersOpen && (
                <div className="fixed inset-0 z-[100] bg-background animate-in slide-in-from-bottom duration-300 flex flex-col md:hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between sticky top-0 bg-background z-10">
                        <h2 className="font-serif text-xl font-bold">Filter Products</h2>
                        <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 hover:bg-muted rounded-full">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        <SidebarContent />
                    </div>
                    <div className="p-5 border-t border-border bg-background sticky bottom-0">
                        <Button onClick={() => setIsMobileFiltersOpen(false)} className="w-full rounded-2xl h-12 font-bold text-base">
                            View {products.length} Products
                        </Button>
                    </div>
                </div>
            )}
        </section>
    );
}
