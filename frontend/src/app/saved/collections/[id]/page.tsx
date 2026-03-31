'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, LayoutGrid, Trash2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import LookCard from '@/components/ui/LookCard';
import { Button } from '@/components/ui/button';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface CollectionDetail {
    _id: string;
    name: string;
    description: string;
    isPrivate: boolean;
    userId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    looks: any[]; // Populated looks
}

export default function CollectionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const collectionId = params.id as string;

    const [collection, setCollection] = useState<CollectionDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        const fetchCollection = async () => {
            try {
                const data = await api.get<CollectionDetail>(`/api/collections/${collectionId}`);
                setCollection(data);
            } catch (err) {
                console.error('Failed to load collection details:', err);
                setError('Collection not found or you do not have permission to view it.');
            } finally {
                setIsLoading(false);
            }
        };

        if (collectionId) {
            fetchCollection();
        }
    }, [collectionId]);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/api/collections/${collectionId}`);
            router.push('/saved/collections');
        } catch (error) {
            console.error('Failed to delete collection', error);
            alert('Failed to delete collection');
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 mt-8">
                {isLoading ? (
                    <div className="flex items-center justify-center py-32 text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 mb-6">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="font-medium">{error}</p>
                    </div>
                ) : collection ? (
                    <>
                        <div className="mb-10 w-full max-w-4xl mx-auto bg-background rounded-3xl p-8 border border-border shadow-sm flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-6">
                                <LayoutGrid className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h1 className="font-serif text-4xl font-bold mb-3">{collection.name}</h1>
                            {collection.description && (
                                <p className="text-muted-foreground max-w-lg mx-auto mb-6">{collection.description}</p>
                            )}
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium px-4 py-1.5 bg-muted rounded-full">
                                    {collection.looks.length} {collection.looks.length === 1 ? 'item' : 'items'}
                                </span>
                                {collection.isPrivate && (
                                    <span className="text-sm font-medium px-4 py-1.5 bg-secondary text-secondary-foreground rounded-full">
                                        Private
                                    </span>
                                )}
                            </div>

                            <div className="mt-8 flex items-center justify-center gap-4 w-full border-t border-border pt-6">
                                <Button variant="ghost" asChild className="rounded-full">
                                    <Link href="/saved/collections">
                                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Boards
                                    </Link>
                                </Button>
                                <Button variant="destructive" onClick={() => setShowDeleteModal(true)} disabled={isDeleting} className="rounded-full">
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                    Delete Board
                                </Button>
                            </div>
                        </div>

                        <ConfirmModal
                            isOpen={showDeleteModal}
                            onClose={() => setShowDeleteModal(false)}
                            onConfirm={handleDelete}
                            title="Delete Collection"
                            message="Are you sure you want to delete this board? This cannot be undone."
                            confirmText="Delete"
                            variant="danger"
                            isLoading={isDeleting}
                        />

                        {collection.looks.length === 0 ? (
                            <div className="text-center py-20 bg-background rounded-3xl border border-dashed border-border shadow-sm max-w-4xl mx-auto">
                                <h3 className="text-xl font-bold mb-2">This board is empty</h3>
                                <p className="text-muted-foreground">Save some looks to this board to see them here.</p>
                                <Button asChild className="mt-6 rounded-full">
                                    <Link href="/">Explore Feed</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                                {collection.looks.map((look) => (
                                    <LookCard
                                        key={look._id}
                                        id={look._id}
                                        title={look.title || 'Untitled Look'}
                                        imageUrl={look.imageUrl}
                                        videoUrl={look.videoUrl}
                                        creatorName={look.sellerId?.name || 'Aura Creator'}
                                        creatorAvatar={look.sellerId?.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'}
                                        creatorId={look.sellerId?._id}
                                        occasion={look.occasion?.[0] || 'Style'}
                                        budgetRange={look.budgetRange || 'mid-range'}
                                        saves={look.savesCount || 0}
                                        views={look.viewsCount || 0}
                                        likes={look.likesCount || 0}
                                        products={look.productsIncluded}
                                        layoutMetadata={look.layoutMetadata}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                ) : null}
            </main>
        </div>
    );
}
