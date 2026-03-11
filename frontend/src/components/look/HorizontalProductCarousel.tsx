'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Star, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Product {
    _id: string;
    name: string;
    brand?: string;
    price: number;
    salePrice?: number;
    discountPercentage?: number;
    imageUrl: string;
    matchType?: 'exact' | 'similar';
}

interface HorizontalProductCarouselProps {
    products: Product[];
}

export default function HorizontalProductCarousel({ products }: HorizontalProductCarouselProps) {
    if (!products || products.length === 0) return null;

    return (
        <div className="w-full mt-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 px-1 flex items-center gap-2">
                <ShoppingBag className="w-3 h-3" /> Shop the Look
            </h4>
            
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1 snap-x">
                {products.map((product) => (
                    <Link 
                        key={product._id} 
                        href={`/product/${product._id}`}
                        className="flex-none w-32 snap-start group/pcard"
                    >
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary mb-2 border border-border/50">
                            <Image 
                                src={product.imageUrl} 
                                alt={product.name} 
                                fill 
                                className="object-cover transition-transform duration-500 group-hover/pcard:scale-110"
                                sizes="128px"
                            />
                            
                            {/* Match Type Badge */}
                            {product.matchType && (
                                <div className="absolute top-1.5 left-1.5">
                                    <Badge 
                                        variant={product.matchType === 'exact' ? 'default' : 'secondary'} 
                                        className="text-[8px] px-1.5 py-0 h-4 uppercase font-black tracking-tighter"
                                    >
                                        {product.matchType}
                                    </Badge>
                                </div>
                            )}

                            {/* Sale Badge */}
                            {product.discountPercentage && (
                                <div className="absolute top-1.5 right-1.5">
                                    <Badge 
                                        variant="destructive" 
                                        className="text-[8px] px-1.5 py-0 h-4 font-black flex items-center gap-0.5"
                                    >
                                        <TrendingDown className="w-2 h-2" />
                                        {product.discountPercentage}%
                                    </Badge>
                                </div>
                            )}
                        </div>

                        <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-foreground truncate">{product.name}</p>
                            <p className="text-[9px] text-muted-foreground font-medium truncate">{product.brand || 'Premium Brand'}</p>
                            <div className="flex items-center gap-2">
                                {product.salePrice ? (
                                    <>
                                        <span className="text-xs font-black text-primary">₹{product.salePrice.toLocaleString()}</span>
                                        <span className="text-[10px] text-muted-foreground line-through opacity-50">₹{product.price.toLocaleString()}</span>
                                    </>
                                ) : (
                                    <span className="text-xs font-black text-foreground">₹{product.price.toLocaleString()}</span>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
