'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, ChevronRight, ShoppingBag } from 'lucide-react';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

interface Product {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
    brand?: string;
    productType: string;
    productUrl?: string;
}

interface SimilarProductSuggestionsProps {
    productId: string;
    productType: string;
    onProductClick?: (product: Product) => void;
}

export default function SimilarProductSuggestions({ productId, productType, onProductClick }: SimilarProductSuggestionsProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSimilar = async () => {
            try {
                const data = await api.get<Product[]>(`/api/products/${productId}/similar`);
                setProducts(data);
            } catch (error) {
                console.error('Failed to fetch similar products:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSimilar();
    }, [productId]);

    const handleProductClick = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();

        if (onProductClick) {
            onProductClick(product);
            return;
        }

        const url = product.productUrl;
        if (!url) return;

        let absoluteUrl = url.trim();
        if (absoluteUrl.startsWith('http://')) {
            absoluteUrl = absoluteUrl.replace('http://', 'https://');
        } else if (!absoluteUrl.startsWith('https://')) {
            absoluteUrl = `https://${absoluteUrl}`;
        }

        window.open(absoluteUrl, '_blank', 'noopener');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <div className="mt-6 border-t border-border pt-6 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-primary" />
                    Similar {productType} you might like
                </h3>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1 -mx-1 snap-x">
                {products.map((product) => (
                    <div
                        key={product._id}
                        onClick={(e) => handleProductClick(e, product)}
                        className="flex-none w-40 group snap-start cursor-pointer transition-transform hover:scale-[1.02]"
                    >
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary mb-2 ring-1 ring-border group-hover:ring-primary/50 transition-all">
                            <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                sizes="160px"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-foreground truncate">{product.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{product.brand || 'Aura Selection'}</p>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-600">₹{product.price.toLocaleString()}</span>
                                <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
