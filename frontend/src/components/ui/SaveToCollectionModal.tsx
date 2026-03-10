'use client';

import { useState, useEffect } from 'react';
import { Bookmark, Plus, X, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, getSavedLookIds, clearSavedLookCache } from '@/lib/api';

interface Collection {
    _id: string;
    name: string;
    description?: string;
    isPrivate: boolean;
    looks: string[];
}

interface SaveToCollectionModalProps {
    lookId: string;
    initialSaves: number; // for the UI placeholder if needed
}

export default function SaveToCollectionModal({ lookId, initialSaves }: SaveToCollectionModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Quick Save (Default to User.savedLooks) State
    const [isSavedGeneral, setIsSavedGeneral] = useState(false);
    const [isLikingGeneral, setIsLikingGeneral] = useState(false);

    // New Collection State
    const [isCreating, setIsCreating] = useState(false);
    const [newCollectionName, setNewCollectionName] = useState('');

    useEffect(() => {
        let mounted = true;
        // Check if saved generally
        getSavedLookIds().then(ids => {
            if (mounted && ids.includes(lookId)) {
                setIsSavedGeneral(true);
            }
        });

        // Add Escape key listener
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);

        return () => {
            mounted = false;
            window.removeEventListener('keydown', handleEsc);
        };
    }, [lookId]);

    const fetchCollections = async () => {
        setIsLoading(true);
        try {
            const data = await api.get<Collection[]>('/api/collections');
            setCollections(data);
        } catch (error) {
            console.error('Failed to fetch collections', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = () => {
        const userStr = localStorage.getItem('aura_user');
        if (!userStr) {
            alert('Please login to save looks!');
            return;
        }
        setIsOpen(true);
        fetchCollections();
    };

    const toggleGeneralSave = async () => {
        setIsLikingGeneral(true);
        setIsSavedGeneral(!isSavedGeneral);
        try {
            const res = await api.post<any>(`/api/users/saves/${lookId}`, {});
            setIsSavedGeneral(res.saved);
            clearSavedLookCache();
        } catch (error) {
            setIsSavedGeneral(isSavedGeneral);
            console.error('Failed to general save look:', error);
        } finally {
            setIsLikingGeneral(false);
        }
    };

    const toggleCollectionSave = async (collectionId: string, currentlySaved: boolean) => {
        // Optimistically update collection in local state
        setCollections(collections.map(c => {
            if (c._id === collectionId) {
                const newLooks = currentlySaved
                    ? c.looks.filter(id => id !== lookId)
                    : [...c.looks, lookId];
                return { ...c, looks: newLooks };
            }
            return c;
        }));

        try {
            await api.post(`/api/collections/${collectionId}/looks`, { lookId });
        } catch (error) {
            console.error('Failed to toggle look in collection', error);
            // Revert on failure (simplified for brevity)
            fetchCollections();
        }
    };

    const handleCreateCollection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCollectionName.trim()) return;

        setIsCreating(true);
        try {
            const newCol = await api.post<Collection>('/api/collections', {
                name: newCollectionName.trim(),
                isPrivate: false,
            });
            // Automatically add the look to the newly created collection
            await api.post(`/api/collections/${newCol._id}/looks`, { lookId });
            setNewCollectionName('');
            await fetchCollections(); // Refresh list to show newly added look in new collection
        } catch (error) {
            console.error('Failed to create collection', error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <>
            {/* The Trigger Button */}
            <Button
                variant="outline"
                onClick={handleOpenModal}
                className={`rounded-full gap-2 transition-colors ${isSavedGeneral ? 'border-primary bg-primary text-white hover:bg-primary/90' : ''}`}
            >
                <Bookmark className={`w-4 h-4 ${isSavedGeneral ? 'fill-current text-white' : ''}`} />
                {isSavedGeneral ? 'Saved' : 'Save'}
            </Button>

            {/* The Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-background w-full max-w-sm rounded-[32px] border border-border shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h2 className="font-semibold text-lg">Save to board</h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full w-8 h-8">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Modal Body: List of collections */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            <div
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={toggleGeneralSave}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                        <Bookmark className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">Profile Favorites</p>
                                        <p className="text-xs text-muted-foreground">General saves</p>
                                    </div>
                                </div>
                                {isLikingGeneral ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                ) : isSavedGeneral ? (
                                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5 text-primary-foreground stroke-[3]" />
                                    </div>
                                ) : (
                                    <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />
                                )}
                            </div>

                            {isLoading ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                collections.map(collection => {
                                    const isSavedHere = collection.looks.includes(lookId);
                                    // Use the first look's image as preview if available? Not immediately possible without populating, fallback to an icon.
                                    return (
                                        <div
                                            key={collection._id}
                                            className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
                                            onClick={() => toggleCollectionSave(collection._id, isSavedHere)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0 overflow-hidden">
                                                    <span className="font-serif text-lg text-muted-foreground">
                                                        {collection.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{collection.name}</p>
                                                    <p className="text-xs text-muted-foreground">{collection.looks.length} looks</p>
                                                </div>
                                            </div>
                                            {isSavedHere ? (
                                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                                    <Check className="w-3.5 h-3.5 text-primary-foreground stroke-[3]" />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30" />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Modal Footer: Create new collection */}
                        <div className="p-4 border-t border-border bg-muted/20 space-y-3">
                            <form onSubmit={handleCreateCollection} className="flex gap-2">
                                <Input
                                    placeholder="Create new board..."
                                    className="rounded-full bg-background border-border h-11"
                                    value={newCollectionName}
                                    onChange={e => setNewCollectionName(e.target.value)}
                                    disabled={isCreating}
                                />
                                <Button type="submit" size="icon" className="rounded-full shrink-0 h-11 w-11" disabled={!newCollectionName.trim() || isCreating}>
                                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5" />}
                                </Button>
                            </form>

                            <Button
                                variant="outline"
                                className="w-full rounded-full h-11 font-bold border-border"
                                onClick={() => setIsOpen(false)}
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
