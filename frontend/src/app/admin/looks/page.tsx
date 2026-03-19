'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import AdminGuard from '@/components/layout/AdminGuard';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Loader2, ChevronLeft, Search, Trash2, ExternalLink, Eye, Bookmark, AlertCircle, Edit2, X, Plus, Flame, TrendingUp } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface AdminLook {
    _id: string;
    title: string;
    imageUrl: string;
    occasion: string[];
    budgetRange: string;
    savesCount: number;
    viewsCount: number;
    likesCount: number;
    trendingScore: number;
    isFeatured: boolean;
    isInternal: boolean;
    status: string;
    isUserCreated: boolean;
    createdAt: string;
    sellerId: {
        _id: string;
        name: string;
        storeName?: string;
        profileImage?: string;
    };
}

interface LooksResponse {
    looks: AdminLook[];
    total: number;
    page: number;
    pages: number;
}

function LooksContent() {
    const [data, setData] = useState<LooksResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [featuringId, setFeaturingId] = useState<string | null>(null);
    const [error, setError] = useState('');

    // Confirm Modal State
    const [confirmDelete, setConfirmDelete] = useState<{ id: string, title: string } | null>(null);

    // Edit Modal State
    const [editingLook, setEditingLook] = useState<AdminLook | null>(null);
    const [editForm, setEditForm] = useState({ title: '', imageUrl: '' });

    const fetchLooks = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '12' });
            if (search) params.set('search', search);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res = await api.get<any>(`/api/admin/looks?${params.toString()}`);
            setData(res);
        } catch (err) {
            console.error(err);
            setError('Failed to load looks.');
        } finally {
            setIsLoading(false);
        }
    }, [page, search]);

    useEffect(() => { fetchLooks(); }, [fetchLooks]);

    const handleDeleteClick = (e: React.MouseEvent, lookId: string, title: string) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmDelete({ id: lookId, title });
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        const lookId = confirmDelete.id;
        setDeletingId(lookId);
        setConfirmDelete(null);
        try {
            await api.delete(`/api/admin/looks/${lookId}`);
            setData(prev => prev ? {
                ...prev,
                looks: prev.looks.filter(l => l._id !== lookId),
                total: prev.total - 1
            } : null);
        } catch (err) {
            console.error('Delete error:', err);
            alert('Failed to delete look.');
        } finally {
            setDeletingId(null);
        }
    };

    const handleFeatureToggle = async (e: React.MouseEvent, look: AdminLook) => {
        e.preventDefault();
        e.stopPropagation();
        setFeaturingId(look._id);
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res = await api.patch<any>(`/api/admin/looks/${look._id}/feature`, {});
            setData(prev => prev ? {
                ...prev,
                looks: prev.looks.map(l => l._id === look._id
                    ? { ...l, isFeatured: res.isFeatured, status: res.status }
                    : l
                )
            } : null);
        } catch (err) {
            console.error('Feature toggle error:', err);
            alert('Failed to update look feature status.');
        } finally {
            setFeaturingId(null);
        }
    };

    const handleEditClick = (look: AdminLook) => {
        setEditingLook(look);
        setEditForm({ title: look.title, imageUrl: look.imageUrl });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLook) return;
        setUpdatingId(editingLook._id);
        try {
            await api.put(`/api/admin/looks/${editingLook._id}`, editForm);
            setData(prev => prev ? {
                ...prev,
                looks: prev.looks.map(l => l._id === editingLook._id ? { ...l, ...editForm } : l)
            } : null);
            setEditingLook(null);
        } catch (err) {
            console.error(err);
            alert('Failed to update look.');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 mt-8 md:mt-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild className="rounded-full">
                            <Link href="/admin"><ChevronLeft className="w-5 h-5" /></Link>
                        </Button>
                        <div>
                            <div className="text-sm text-muted-foreground mb-0.5">
                                <Link href="/admin" className="text-primary font-medium hover:underline">Admin</Link>
                                <span className="mx-1">›</span> Looks
                            </div>
                            <h1 className="font-serif text-xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                                <ImageIcon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" /> Content Moderation
                            </h1>
                        </div>
                    </div>
                    <Button asChild className="rounded-full px-5">
                        <Link href="/admin/looks/new">
                            <Plus className="w-4 h-4 mr-2" /> Create Trending Look
                        </Link>
                    </Button>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-background rounded-2xl border border-border text-sm">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                            <Flame className="w-3 h-3" /> In Trending
                        </span>
                        <span className="text-muted-foreground">= visible in Discover feed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-muted text-muted-foreground rounded-full text-xs font-semibold">
                            Draft
                        </span>
                        <span className="text-muted-foreground">= user/seller look, not in feed</span>
                    </div>
                    <p className="text-muted-foreground ml-auto text-xs italic">Click 🔥 to feature any look in the Trending section</p>
                </div>

                {/* Search */}
                <div className="relative max-w-sm mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search looks by title..."
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
                ) : data?.looks.length === 0 ? (
                    <div className="text-center py-20 bg-background rounded-3xl border border-dashed border-border">
                        <p className="text-muted-foreground">No looks found.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {data?.looks.map(look => (
                                <div key={look._id} className="group bg-background rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all">
                                    {/* Image */}
                                    <div className="relative aspect-[3/4] w-full bg-secondary overflow-hidden">
                                        <Image
                                            src={look.imageUrl}
                                            alt={look.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {/* Status badge overlay */}
                                        <div className="absolute top-2 left-2 z-10">
                                            {look.isFeatured ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500 text-white rounded-full text-[10px] font-bold shadow-lg">
                                                    <Flame className="w-3 h-3" /> Featured
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/60 text-white/80 rounded-full text-[10px] font-semibold backdrop-blur-sm">
                                                    Draft
                                                </span>
                                            )}
                                        </div>
                                        {/* Overlay actions */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <Link
                                                href={`/look/${look._id}`}
                                                target="_blank"
                                                className="p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition-colors text-white"
                                                title="View look"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleEditClick(look); }}
                                                className="p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-sm transition-colors text-white"
                                                title="Edit look"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteClick(e, look._id, look.title)}
                                                disabled={deletingId === look._id}
                                                className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full backdrop-blur-sm transition-colors text-white"
                                                title="Delete look"
                                            >
                                                {deletingId === look._id
                                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                                    : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Meta */}
                                    <div className="p-4">
                                        <p className="font-semibold text-foreground text-sm leading-tight mb-1 truncate">{look.title}</p>
                                        <p className="text-xs text-muted-foreground mb-3 truncate">
                                            by {look.sellerId?.storeName || look.sellerId?.name || 'Unknown'}
                                            {look.isUserCreated && <span className="ml-1 text-primary">(user look)</span>}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3 h-3" /> {look.viewsCount || 0}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Bookmark className="w-3 h-3" /> {look.savesCount || 0}
                                            </span>
                                            <span className="flex items-center gap-1 text-orange-600 font-medium">
                                                <TrendingUp className="w-3 h-3" /> {look.trendingScore || 0}
                                            </span>
                                        </div>

                                        {/* Feature Toggle Button */}
                                        <button
                                            onClick={(e) => handleFeatureToggle(e, look)}
                                            disabled={featuringId === look._id}
                                            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${look.isFeatured
                                                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200'
                                                : 'bg-muted text-muted-foreground hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 border border-border'
                                                }`}
                                        >
                                            {featuringId === look._id ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : look.isFeatured ? (
                                                <><Flame className="w-3 h-3" /> Remove from Featured</>
                                            ) : (
                                                <><Flame className="w-3 h-3" /> Feature on Main Page</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {data && data.pages > 1 && (
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                                <p className="text-sm text-muted-foreground">{data.total} looks total</p>
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

            {/* Edit Modal */}
            {editingLook && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-background w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                            <h3 className="font-bold text-lg text-foreground">Edit Look</h3>
                            <button onClick={() => setEditingLook(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.title}
                                    onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Image URL</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={editForm.imageUrl}
                                    onChange={e => setEditForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/20 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
                                />
                                <p className="text-[11px] text-muted-foreground italic">Note: Changing the image URL will update the look&apos;s cover image platform-wide.</p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setEditingLook(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={updatingId === editingLook._id} className="flex-1 rounded-xl gap-2">
                                    {updatingId === editingLook._id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Deletion Confirmation */}
            <ConfirmModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDelete}
                title="Delete Look?"
                message={`Remove "${confirmDelete?.title}" from the platform? This cannot be undone.`}
                confirmText="Yes, Delete"
                cancelText="Keep Look"
                variant="danger"
            />
        </div>
    );
}

export default function AdminLooksPage() {
    return (
        <AdminGuard>
            <LooksContent />
        </AdminGuard>
    );
}
