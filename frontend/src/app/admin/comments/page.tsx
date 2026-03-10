'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import AdminGuard from '@/components/layout/AdminGuard';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2, ChevronLeft, Trash2, AlertCircle, User, Calendar, ExternalLink } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Image from 'next/image';

interface AdminComment {
    _id: string;
    content: string;
    user: {
        _id: string;
        name: string;
        email: string;
        profileImage?: string;
    } | null;
    look: {
        _id: string;
        title: string;
        imageUrl: string;
    };
    createdAt: string;
}

interface CommentsResponse {
    comments: AdminComment[];
    total: number;
    page: number;
    pages: number;
}

function CommentsContent() {
    const [data, setData] = useState<CommentsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState('');

    // Confirm Modal State
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get<CommentsResponse>(`/api/admin/comments?page=${page}&limit=20`);
            setData(res);
        } catch (err) {
            console.error(err);
            setError('Failed to load comments.');
        } finally {
            setIsLoading(false);
        }
    }, [page]);

    useEffect(() => { fetchComments(); }, [fetchComments]);

    const handleDeleteClick = (commentId: string) => {
        setConfirmDelete(commentId);
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        const commentId = confirmDelete;
        setDeletingId(commentId);
        setConfirmDelete(null);
        try {
            await api.delete(`/api/admin/comments/${commentId}`);
            setData(prev => prev ? {
                ...prev,
                comments: prev.comments.filter(c => c._id !== commentId),
                total: prev.total - 1
            } : null);
        } catch (err) {
            console.error(err);
            alert('Failed to delete comment.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 mt-8 md:mt-12">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href="/admin"><ChevronLeft className="w-5 h-5" /></Link>
                    </Button>
                    <div>
                        <div className="text-sm text-muted-foreground mb-0.5">
                            <Link href="/admin" className="text-primary font-medium hover:underline">Admin</Link>
                            <span className="mx-1">›</span> Comments
                        </div>
                        <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-2">
                            <MessageSquare className="w-7 h-7 text-primary" /> Comment Moderation
                        </h1>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 mb-6">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex justify-center py-24">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : data?.comments.length === 0 ? (
                    <div className="text-center py-20 bg-background rounded-3xl border border-dashed border-border">
                        <p className="text-muted-foreground">No comments found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {data?.comments.map(comment => (
                            <div key={comment._id} className="bg-background rounded-2xl border border-border p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex gap-4">
                                        <div className="shrink-0">
                                            {comment.user?.profileImage ? (
                                                <div className="w-10 h-10 rounded-full overflow-hidden border border-border">
                                                    <Image src={comment.user.profileImage} alt={comment.user.name} width={40} height={40} className="object-cover" />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border/50">
                                                    <User className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm text-foreground">{comment.user?.name ?? 'Deleted User'}</span>
                                                <span className="text-xs text-muted-foreground">•</span>
                                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground bg-muted/30 p-3 rounded-xl border border-border/50 italic">
                                                "{comment.content}"
                                            </p>
                                            <div className="flex items-center gap-3 pt-2">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>on look:</span>
                                                    <Link href={`/look/${comment.look?._id}`} className="text-primary font-medium hover:underline flex items-center gap-1">
                                                        {comment.look?.title || 'Unknown Look'}
                                                        <ExternalLink className="w-3 h-3" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteClick(comment._id)}
                                        disabled={deletingId === comment._id}
                                        className="text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                                    >
                                        {deletingId === comment._id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {data && data.pages > 1 && (
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                                <p className="text-sm text-muted-foreground">{data.total} comments total</p>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                                        Prev
                                    </Button>
                                    <span className="flex items-center text-sm font-medium px-4">{page} / {data.pages}</span>
                                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => setPage(p => p + 1)} disabled={page >= data.pages}>
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Deletion Confirmation */}
            <ConfirmModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDelete}
                title="Delete Comment?"
                message="Permanently delete this comment and its replies? This action cannot be reversed."
                confirmText="Yes, Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    );
}

export default function AdminCommentsPage() {
    return (
        <AdminGuard>
            <CommentsContent />
        </AdminGuard>
    );
}
