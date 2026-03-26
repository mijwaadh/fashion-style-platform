'use client';

import { useState, useEffect } from 'react';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface FollowButtonProps {
    targetId: string;
    initialFollowers: number;
}

export default function FollowButton({ targetId, initialFollowers }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [followersCount, setFollowersCount] = useState(initialFollowers);
    const [isSelf, setIsSelf] = useState(false);

    useEffect(() => {
        // Hydrate initial following state if user is logged in
        const userStr = sessionStorage.getItem('aura_user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.id === targetId || user._id === targetId) {
                    setIsSelf(true);
                    return;
                }

                // Pre-check if targetId is in user's following list natively here
                // Note: The global auth context really should provide this list if it was a larger app.
                // For Aura Phase 5 we will fetch a quick status check if needed.
                const checkStatus = async () => {
                    // This is a naive check. A true robust implementation would have a global store.
                    try {
                        const me = await api.get<any>('/api/users/me'); // We would need to ensure /me returns the following array
                        if (me && me.following && me.following.includes(targetId)) {
                            setIsFollowing(true);
                        }
                    } catch (error) {
                        // ignore
                    }
                }
                checkStatus();
            } catch (e) {
                console.error("Failed to parse user for Follow status");
            }
        }
    }, [targetId]);

    const toggleFollow = async () => {
        const userStr = sessionStorage.getItem('aura_user');
        if (!userStr) {
            alert('Please login to follow creators!');
            return;
        }

        const user = JSON.parse(userStr);
        if (user.id === targetId) {
            alert("You cannot follow yourself.");
            return;
        }

        setIsLoading(true);
        // Optimistic UI updates
        const nextFollowingState = !isFollowing;
        setIsFollowing(nextFollowingState);
        setFollowersCount(prev => (nextFollowingState ? prev + 1 : prev - 1));
        window.dispatchEvent(new CustomEvent('aura:follow', { detail: { targetId, isFollowing: nextFollowingState } }));

        try {
            const res = await api.post<any>(`/api/users/follow/${targetId}`, {});
            setIsFollowing(res.following);
        } catch (error) {
            console.error('Failed to follow/unfollow:', error);
            // Revert state on failure
            setIsFollowing(isFollowing);
            setFollowersCount(prev => (isFollowing ? prev + 1 : prev - 1));
            window.dispatchEvent(new CustomEvent('aura:follow', { detail: { targetId, isFollowing: isFollowing } }));
        } finally {
            setIsLoading(false);
        }
    };

    if (isSelf) return null;

    return (
        <Button
            variant={isFollowing ? "outline" : "default"}
            size="lg"
            onClick={toggleFollow}
            disabled={isLoading}
            className={`rounded-full px-8 shrink-0 w-full md:w-auto transition-all duration-300 ${isFollowing
                ? 'border-primary text-primary hover:bg-primary/5'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg'
                }`}
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : isFollowing ? (
                <UserCheck className="w-5 h-5 mr-2" />
            ) : (
                <UserPlus className="w-5 h-5 mr-2" />
            )}
            {isFollowing ? 'Following' : 'Follow'}
        </Button>
    );
}

export function FollowerCount({ targetId, initialCount }: { targetId: string, initialCount: number }) {
    const [count, setCount] = useState(initialCount);

    useEffect(() => {
        let isCurrentlyFollowing: boolean | null = null;

        const handleFollowDelta = (e: any) => {
            if (e.detail.targetId === targetId) {
                if (isCurrentlyFollowing === null) {
                    // First interaction, based on next state, we either add or remove
                    setCount(prev => e.detail.isFollowing ? prev + 1 : prev - 1);
                } else {
                    if (isCurrentlyFollowing !== e.detail.isFollowing) {
                        setCount(prev => e.detail.isFollowing ? prev + 1 : prev - 1);
                    }
                }
                isCurrentlyFollowing = e.detail.isFollowing;
            }
        };

        window.addEventListener('aura:follow', handleFollowDelta);
        return () => window.removeEventListener('aura:follow', handleFollowDelta);
    }, [targetId]);

    return <>{count.toLocaleString()}</>;
}
