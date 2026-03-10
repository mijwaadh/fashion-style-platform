'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Loader2, Sparkles } from 'lucide-react';
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
}

export default function SimilarLookProducts({ firstProductId }: { firstProductId: string }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firstProductId) return;

        const fetchSimilar = async () => {
            setLoading(true);
            try {
                const data = await api.get<Product[]>(`/api/products/${firstProductId}/similar`);
                setProducts(data || []);
            } catch (err) {
                console.error("Failed to load similar products for look:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSimilar();
    }, [firstProductId]);

    if (loading) return (
        <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
        </div>
    );

    if (products.length === 0) return null;

    return (
        <section className="mt-16 pt-16 border-t border-border">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <Sparkles className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-2xl font-serif font-bold text-foreground">Complete Your Discovery</h2>
                    <p className="text-sm text-muted-foreground">Similar pieces you might love based on this look.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {products.map(product => (
                    <ProductCardWithRating
                        key={product._id}
                        product={product}
                        showReviewCount={false}
                        showSimilarButton={false}
                    />
                ))}
            </div>
        </section>
    );
}
