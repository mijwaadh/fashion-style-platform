'use client';

import { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface LikeButtonProps {
    lookId: string;
    initialLikes: number;
}

export default function LikeButton({ lookId, initialLikes }: LikeButtonProps) {
    const { user, updateUser } = useAuth();
    const [likesCount, setLikesCount] = useState(initialLikes);
    const [isLiking, setIsLiking] = useState(false);

    // Get liked status from global auth state
    const isLiked = user?.likedLooks?.includes(lookId) || false;

    const toggleLike = async () => {
        if (!user) {
            toast.error('Please login to like looks!');
            return;
        }

        setIsLiking(true);
        // We now rely on global state for UI color, but we still do optimistic-like count if we wanted
        // However, for simplicity and strict sync, let's just let the API call update it

        try {
            const res = await api.post<any>(`/api/looks/${lookId}/like`, {});
            if (res.isLiked !== undefined) {
                // Update global user state
                let newLikedLooks = [...(user.likedLooks || [])];
                if (res.isLiked) {
                    if (!newLikedLooks.includes(lookId)) newLikedLooks.push(lookId);
                } else {
                    newLikedLooks = newLikedLooks.filter(id => id !== lookId);
                }

                updateUser({ likedLooks: newLikedLooks });
                setLikesCount(res.likesCount);
            }
        } catch (error) {
            console.error('Failed to like look:', error);
            toast.error('Failed to like look');
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleLike}
                disabled={isLiking}
                className={`rounded-full transition-all duration-300 ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
            >
                {isLiking ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                )}
            </Button>
            {likesCount > 0 && <span className={`text-sm font-medium ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}>{likesCount}</span>}
        </div>
    );
}
