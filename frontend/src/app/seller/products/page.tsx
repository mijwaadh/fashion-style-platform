'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Loader2, PackageOpen, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import StarRating from '@/components/ui/StarRating';

interface Product {
    _id: string;
    name: string;
    brand: string;
    price: number;
    category: string;
    imageUrl: string;
    inStock: boolean;
    averageRating?: number;
}

export default function SellerProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const userStr = localStorage.getItem('aura_user');
            if (!userStr) return;
            const { _id } = JSON.parse(userStr);
            const data = await api.get<Product[]>(`/api/products?sellerId=${_id}`);
            setProducts(data);
        } catch (err) {
            console.error("Failed to load products:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return;

        try {
            await api.delete(`/api/products/${id}`);
            setProducts(prev => prev.filter(p => p._id !== id));
        } catch (err: any) {
            alert(err.message || "Failed to delete product.");
        }
    };

    return (
        <div className="min-h-screen bg-muted/30 pb-20">
            <header className="bg-background border-b border-border sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/seller/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="font-serif text-xl font-bold text-foreground">My Products</h1>
                    </div>
                    <Button asChild variant="default" className="rounded-full px-5">
                        <Link href="/seller/products/new"><Plus className="w-4 h-4 mr-2" /> Add Product</Link>
                    </Button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 mt-8">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-background rounded-2xl border border-border shadow-sm text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                            <PackageOpen className="w-8 h-8" />
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-foreground mb-2">No Products Yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">Add individual clothing items so you can tag them later when creating an outfit Look.</p>
                        <Button asChild variant="default" className="rounded-full px-8">
                            <Link href="/seller/products/new">Add First Product</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                        {products.map(product => (
                            <div key={product._id} className="group bg-background rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                                <div className="relative aspect-[4/5] w-full bg-secondary overflow-hidden">
                                    <Image src={product.imageUrl} alt={product.name} fill sizes="(max-width: 768px) 100vw, 300px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/seller/products/${product._id}/edit`} className="p-2 bg-background/90 hover:bg-background text-foreground rounded-full shadow-sm backdrop-blur-sm transition-colors" title="Edit Product">
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product._id, product.name)}
                                            className="p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-full shadow-sm backdrop-blur-sm transition-colors"
                                            title="Delete Product"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {!product.inStock && (
                                        <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-sm">
                                            <Badge variant="destructive" className="font-semibold px-3 py-1 text-xs tracking-wider uppercase">Out of Stock</Badge>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex flex-col flex-1">
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{product.brand}</p>
                                    <h3 className="font-semibold text-foreground text-sm leading-tight mb-2 line-clamp-2">{product.name}</h3>

                                    <div className="mb-2">
                                        <StarRating initialScore={product.averageRating || 0} size="sm" allowInput={false} />
                                    </div>

                                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-border/50">
                                        <span className="font-bold text-foreground">₹{product.price.toFixed(2)}</span>
                                        <Badge variant="secondary" className="text-[10px] px-2 py-0 border-border">{product.category}</Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
