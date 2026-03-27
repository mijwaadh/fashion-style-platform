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
    stockQuantity: number;
    averageRating?: number;
    listingType?: string;
}

export default function SellerProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);
    const [newStockValue, setNewStockValue] = useState<string>('');

    const fetchProducts = async () => {
        try {
            const userStr = sessionStorage.getItem('aura_user');
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

    const handleStockUpdate = async (id: string) => {
        const val = parseInt(newStockValue);
        if (isNaN(val) || val < 0) return;

        try {
            const updated = await api.put<Product>(`/api/products/${id}`, { 
                stockQuantity: val,
                inStock: val > 0
            });
            setProducts(prev => prev.map(p => p._id === id ? updated : p));
            setUpdatingStockId(null);
            setNewStockValue('');
        } catch (err: any) {
            alert(err.message || "Failed to update stock.");
        }
    };

    return (
        <div className="pb-20 space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-zinc-900">Inventory Management</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Manage your product listings and real-time stock levels.</p>
                </div>
                <Button asChild variant="default" className="rounded-xl px-6 h-12 font-bold shadow-lg shadow-primary/20">
                    <Link href="/seller/products/new"><Plus className="w-4 h-4 mr-2" /> Add New Product</Link>
                </Button>
            </div>

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
                                    <div className="flex justify-between items-start mb-1 overflow-hidden">
                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider truncate mr-2">{product.brand}</p>
                                        <div className="flex gap-1">
                                            {product.listingType === 'native' && <Badge variant="default" className="text-[8px] h-3.5 px-1 py-0 bg-primary/90">Native</Badge>}
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-foreground text-sm leading-tight mb-2 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>

                                    {/* Quick Stock Tool */}
                                    <div className="mt-auto pt-3 border-t border-border/50">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-bold text-foreground">₹{product.price.toLocaleString()}</span>
                                            {product.listingType === 'native' && (
                                                <div className="flex items-center gap-1.5">
                                                    {updatingStockId === product._id ? (
                                                        <div className="flex items-center bg-muted rounded-md p-0.5 border border-primary/30">
                                                            <input 
                                                                autoFocus
                                                                type="number" 
                                                                className="w-10 bg-transparent text-[10px] font-bold text-center outline-none" 
                                                                value={newStockValue}
                                                                onChange={e => setNewStockValue(e.target.value)}
                                                                onKeyDown={e => e.key === 'Enter' && handleStockUpdate(product._id)}
                                                            />
                                                            <button 
                                                                onClick={() => handleStockUpdate(product._id)}
                                                                className="p-1 bg-primary text-white rounded-sm"
                                                            >
                                                                <Plus className="w-2.5 h-2.5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => {
                                                                setUpdatingStockId(product._id);
                                                                setNewStockValue(product.stockQuantity.toString());
                                                            }}
                                                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-colors ${
                                                                product.stockQuantity < 5 ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                                            }`}
                                                        >
                                                            Stock: {product.stockQuantity}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center bg-muted/30 p-1.5 rounded-lg">
                                             <StarRating initialScore={product.averageRating || 0} size="sm" allowInput={false} />
                                             <span className="text-[10px] text-muted-foreground opacity-50 truncate max-w-[60px]">{product.category}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
}
