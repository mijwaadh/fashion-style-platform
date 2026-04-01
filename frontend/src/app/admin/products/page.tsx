'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import AdminGuard from '@/components/layout/AdminGuard';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Loader2, ChevronLeft, Search, Trash2, ExternalLink, AlertCircle, Package, Edit2, X, Eye, EyeOff, Plus } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Image from 'next/image';

interface AdminProduct {
    _id: string;
    name: string;
    description: string;
    price: number;
    salePrice?: number;
    discountPercentage?: number;
    currency: string;
    category: string;
    imageUrl: string;
    ownerId: {
        _id: string;
        name: string;
        storeName?: string;
    };
    listingType?: 'native' | 'affiliate';
    status: 'draft' | 'published';
    createdAt: string;
}

interface ProductsResponse {
    products: AdminProduct[];
    total: number;
    page: number;
    pages: number;
}

function ProductsContent() {
    const router = useRouter();
    const [data, setData] = useState<ProductsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [publishingId, setPublishingId] = useState<string | null>(null);
    const [error, setError] = useState('');

    // Confirm Modal State
    const [confirmDelete, setConfirmDelete] = useState<{ id: string, name: string } | null>(null);

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '12' });
            if (search) params.set('search', search);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res = await api.get<any>(`/api/admin/products?${params.toString()}`);
            setData(res);
        } catch (err) {
            console.error(err);
            setError('Failed to load products.');
        } finally {
            setIsLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const handleDeleteClick = (e: React.MouseEvent, productId: string, name: string) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmDelete({ id: productId, name });
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        const productId = confirmDelete.id;
        setDeletingId(productId);
        setConfirmDelete(null);
        try {
            await api.delete(`/api/admin/products/${productId}`);
            setData(prev => prev ? {
                ...prev,
                products: prev.products.filter(p => p._id !== productId),
                total: prev.total - 1
            } : null);
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete product. Check console for details.');
        } finally {
            setDeletingId(null);
        }
    };

    const handlePublishToggle = async (e: React.MouseEvent, product: AdminProduct) => {
        e.preventDefault();
        e.stopPropagation();
        setPublishingId(product._id);
        try {
            const res = await api.patch<any>(`/api/admin/products/${product._id}/publish`, {});
            setData(prev => prev ? {
                ...prev,
                products: prev.products.map(p => p._id === product._id
                    ? { ...p, status: res.status }
                    : p
                )
            } : null);
        } catch (err) {
            console.error('Publish toggle error:', err);
            alert('Failed to update product status.');
        } finally {
            setPublishingId(null);
        }
    };

    const handleEditClick = (product: AdminProduct) => {
        router.push(`/admin/products/${product._id}/edit`);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        // Not used anymore as we redirect to a separate edit page
        e.preventDefault();
    };

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 mt-8 md:mt-12">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href="/admin"><ChevronLeft className="w-5 h-5" /></Link>
                    </Button>
                    <div>
                        <div className="text-sm text-muted-foreground mb-0.5">
                            <Link href="/admin" className="text-primary font-medium hover:underline">Admin</Link>
                            <span className="mx-1">›</span> Products
                        </div>
                        <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-2">
                            <Package className="w-7 h-7 text-primary" /> Product Moderation
                        </h1>
                    </div>
                    <div className="ml-auto">
                        <Button asChild className="rounded-full px-5 h-11 shadow-md hover:shadow-lg transition-all active:scale-95">
                            <Link href="/admin/products/new">
                                <Plus className="w-4 h-4 mr-2" /> Add Product
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative max-w-sm mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search products by name..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                    />
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 mb-4">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : data?.products.length === 0 ? (
                    <div className="text-center py-20 bg-background rounded-3xl border border-dashed border-border">
                        <p className="text-muted-foreground">No products found.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {data?.products.map(product => (
                                <div key={product._id} className="group bg-background rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all">
                                    {/* Image */}
                                    <div className="relative aspect-square w-full bg-secondary overflow-hidden">
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {/* Overlay actions */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEditClick(product); }}
                                                className="p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition-colors text-white"
                                                title="Edit product"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteClick(e, product._id, product.name)}
                                                disabled={deletingId === product._id}
                                                className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full backdrop-blur-sm transition-colors text-white"
                                                title="Delete product"
                                            >
                                                {deletingId === product._id
                                                    ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                                                    : <Trash2 className="w-4 h-4 text-white" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Meta */}
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="font-semibold text-foreground text-sm leading-tight truncate">{product.name}</p>
                                            <button
                                                onClick={(e) => handlePublishToggle(e, product)}
                                                disabled={publishingId === product._id}
                                                className={`p-1.5 rounded-lg transition-colors ${
                                                    // @ts-ignore - status added to model
                                                    product.status === 'draft'
                                                        ? 'text-muted-foreground hover:bg-muted'
                                                        : 'text-primary bg-primary/10 hover:bg-primary/20'
                                                    }`}
                                                title={
                                                    // @ts-ignore
                                                    product.status === 'draft' ? 'Publish product' : 'Unpublish product'
                                                }
                                            >
                                                {publishingId === product._id ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    // @ts-ignore
                                                    product.status === 'draft' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-3 truncate">
                                            by {product.ownerId?.storeName || product.ownerId?.name || 'Unknown'}
                                            {
                                                product.status === 'draft' && <span className="ml-1 text-orange-600 font-medium">(Draft)</span>
                                            }
                                        </p>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-baseline gap-2">
                                                <span className="font-bold text-lg text-foreground">
                                                    ₹{product.salePrice || product.price}
                                                </span>
                                                {product.salePrice && product.salePrice < product.price && (
                                                    <>
                                                        <span className="text-xs text-muted-foreground line-through">
                                                            MRP: ₹{product.price}
                                                        </span>
                                                        <span className="text-xs font-bold text-green-600">
                                                            {product.discountPercentage || Math.round((1 - product.salePrice/product.price) * 100)}% Off
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center justify-between text-[10px]">
                                                <span className={`font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${
                                                    product.listingType === 'native' 
                                                        ? 'bg-blue-50 text-blue-700 border-blue-100' 
                                                        : 'bg-zinc-50 text-zinc-600 border-zinc-100'
                                                }`}>
                                                    {product.listingType || 'affiliate'}
                                                </span>
                                                <span className="capitalize px-2 py-0.5 bg-muted rounded-full">{product.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {data && data.pages > 1 && (
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                                <p className="text-sm text-muted-foreground">{data.total} products total</p>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                                        Prev
                                    </Button>
                                    <span className="flex items-center text-sm font-medium px-3">{page} / {data.pages}</span>
                                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => setPage(p => p + 1)} disabled={page >= data.pages}>
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Deletion Confirmation */}
            <ConfirmModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDelete}
                title="Delete Product?"
                message={`Remove "${confirmDelete?.name}" from the platform? This cannot be undone.`}
                confirmText="Yes, Delete"
                cancelText="Keep Product"
                variant="danger"
            />
        </div>
    );
}

export default function AdminProductsPage() {
    return (
        <AdminGuard>
            <ProductsContent />
        </AdminGuard>
    );
}
