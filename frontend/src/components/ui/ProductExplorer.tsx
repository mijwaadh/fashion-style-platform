'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, FilterX } from 'lucide-react';
import ProductCardWithRating from '@/components/look/ProductCardWithRating';

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

const CATEGORIES = ['All', 'Top', 'Bottom', 'Footwear', 'Accessory', 'Outerwear'];

export default function ProductExplorer() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [category, setCategory] = useState<string>('All');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');

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
                if (category && category !== 'All') params.append('category', category);
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
    }, [category, debouncedMin, debouncedMax]);

    const clearFilters = () => {
        setCategory('All');
        setMinPrice('');
        setMaxPrice('');
    };

    return (
        <section className="py-8 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-serif font-bold text-foreground">Explore Products</h2>
                        <p className="text-muted-foreground mt-2 font-medium">Shop individual items from our creators.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto p-4 bg-muted/30 rounded-2xl border border-border">
                        {/* Category Select */}
                        <div className="flex flex-col gap-1 -mt-1 w-full sm:w-auto">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="bg-background border border-border rounded-xl px-3 py-2 text-sm font-medium focus:ring-1 focus:ring-primary w-full sm:w-36"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div className="flex flex-col gap-1 -mt-1 w-full sm:w-auto">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Price Range (₹)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="bg-background border border-border w-24 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                                />
                                <span className="text-muted-foreground">-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="bg-background border border-border w-24 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Clear Filters */}
                        {(category !== 'All' || minPrice || maxPrice) && (
                            <button
                                onClick={clearFilters}
                                className="sm:ml-2 mt-4 sm:mt-0 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                                title="Clear Filters"
                            >
                                <FilterX className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="py-24 text-center bg-muted/20 border-2 border-dashed border-border rounded-2xl">
                        <p className="text-muted-foreground font-medium">No products found matching your filters.</p>
                        <button onClick={clearFilters} className="mt-4 text-primary font-bold hover:underline">
                            Clear filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
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
        </section>
    );
}
