'use client';

import { useState, useEffect } from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, getSavedLookIds, clearSavedLookCache } from '@/lib/api';

interface SaveLookButtonProps {
    lookId: string;
    initialSaves: number;
}

export default function SaveLookButton({ lookId, initialSaves }: SaveLookButtonProps) {
    const [isSaved, setIsSaved] = useState(false);
    const [isLiking, setIsLiking] = useState(false);

    useEffect(() => {
        let mounted = true;
        getSavedLookIds().then(ids => {
            if (mounted && ids.includes(lookId)) {
                setIsSaved(true);
            }
        });
        return () => { mounted = false; };
    }, [lookId]);

    const toggleSave = async () => {
        const userStr = localStorage.getItem('aura_user');
        if (!userStr) {
            alert('Please login to save looks!');
            return;
        }

        setIsLiking(true);
        // Optimistic update
        setIsSaved(!isSaved);

        try {
            const res = await api.post<any>(`/api/users/saves/${lookId}`, {});
            setIsSaved(res.saved);
            clearSavedLookCache();
        } catch (error) {
            // Revert on failure
            setIsSaved(isSaved);
            console.error('Failed to save look:', error);
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={toggleSave}
            disabled={isLiking}
            className={`rounded-full gap-2 transition-colors ${isSaved ? 'border-primary bg-primary text-white hover:bg-primary/90' : ''}`}
        >
            {isLiking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-white' : ''}`} />
            )}
            {isSaved ? 'Saved' : 'Save'}
        </Button>
    );
}
