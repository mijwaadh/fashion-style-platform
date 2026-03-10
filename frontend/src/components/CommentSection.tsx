'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, CornerDownRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// --- Type Definitions ---
interface User {
    _id: string;
    name: string;
    profileImage?: string;
    storeName?: string;
}

interface Comment {
    _id: string;
    content: string;
    user: User;
    look: string;
    parentComment: string | null;
    createdAt: string;
    updatedAt: string;
}

// A nested structure used only by the frontend to render threads easily
interface ThreadedComment extends Comment {
    replies: ThreadedComment[];
}

export default function CommentSection({ lookId }: { lookId: string }) {
    const { user } = useAuth();

    const [comments, setComments] = useState<ThreadedComment[]>([]);
    const [loading, setLoading] = useState(true);

    // Top-level comment state
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Reply state
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [submittingReply, setSubmittingReply] = useState(false);

    useEffect(() => {
        fetchComments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lookId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`${API_URL}/api/looks/${lookId}/comments`);
            if (!res.ok) throw new Error('Failed to fetch comments');
            const data: Comment[] = await res.json();
            setComments(buildCommentTree(data));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Helper: Turns a flat array of comments into a nested tree.
    // 1-level deep is enough for this platform (Instagram style).
    const buildCommentTree = (flatComments: Comment[]): ThreadedComment[] => {
        const commentMap = new Map<string, ThreadedComment>();
        const roots: ThreadedComment[] = [];

        // First pass: create map entries
        flatComments.forEach(c => {
            commentMap.set(c._id, { ...c, replies: [] });
        });

        // Second pass: attach replies to parents or push to roots
        // The backend sorts by newest first (desc). 
        // For replies, oldest to newest (asc) reading order under the parent usually looks better. We will reverse them here.
        flatComments.forEach(c => {
            const threaded = commentMap.get(c._id)!;
            if (c.parentComment) {
                const parent = commentMap.get(c.parentComment);
                if (parent) {
                    // Prepend to reverse the newest-first sort from the backend into oldest-first for replies
                    parent.replies.unshift(threaded);
                }
            } else {
                roots.push(threaded);
            }
        });

        return roots;
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user || !user.token) return;

        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/looks/${lookId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ content: newComment }),
            });

            if (!res.ok) throw new Error('Failed to post comment');
            const createdComment: Comment = await res.json();

            // Optimistically update
            setComments((prev) => [{ ...createdComment, replies: [] }, ...prev]);
            setNewComment('');
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (parentId: string) => {
        if (!replyContent.trim() || !user || !user.token) return;

        setSubmittingReply(true);
        try {
            const res = await fetch(`${API_URL}/api/looks/${lookId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ content: replyContent, parentComment: parentId }),
            });

            if (!res.ok) throw new Error('Failed to post reply');
            const createdReply: Comment = await res.json();

            // Optimistically insert the reply into the tree
            setComments((prevTrees) => {
                return prevTrees.map(root => {
                    if (root._id === parentId) {
                        return { ...root, replies: [...root.replies, { ...createdReply, replies: [] }] };
                    }
                    return root;
                });
            });

            setReplyingTo(null);
            setReplyContent('');
        } catch (error) {
            console.error(error);
        } finally {
            setSubmittingReply(false);
        }
    };

    // --- RENDER HELPERS ---
    const renderCommentNode = (c: ThreadedComment, isReply = false) => (
        <div key={c._id} className={cn("flex gap-3", isReply && "mt-4 ml-10")}>
            <div className={`shrink-0 ${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full overflow-hidden bg-muted`}>
                <Image
                    src={c.user?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user?.name || 'Deleted User')}&background=random`}
                    alt={c.user?.name || 'Deleted User'}
                    width={isReply ? 32 : 40}
                    height={isReply ? 32 : 40}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">
                        {c.user?.storeName || c.user?.name || 'Deleted User'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{c.content}</p>

                {/* Reply Actions */}
                {!isReply && user && (
                    <div className="pt-1">
                        <button
                            onClick={() => setReplyingTo(replyingTo === c._id ? null : c._id)}
                            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                            Reply
                        </button>
                    </div>
                )}

                {/* Inline Reply Input */}
                {replyingTo === c._id && (
                    <div className="flex gap-2 mt-3 mb-2">
                        <input
                            type="text"
                            placeholder={`Reply to ${c.user?.name || 'Deleted User'}...`}
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-muted/20 focus:outline-none focus:ring-1 focus:ring-primary"
                            autoFocus
                        />
                        <Button
                            size="sm"
                            onClick={() => handleReply(c._id)}
                            disabled={!replyContent.trim() || submittingReply}
                        >
                            {submittingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
                        </Button>
                    </div>
                )}

                {/* Render nested replies recursively (only 1 level deep is expected based on UI design) */}
                {c.replies.length > 0 && (
                    <div className="space-y-4">
                        {c.replies.map(r => renderCommentNode(r, true))}
                    </div>
                )}
            </div>
        </div>
    );

    if (loading) {
        return <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <div className="py-8 border-t border-border mt-12">
            <h3 className="font-serif text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                {comments.length} Comments
            </h3>

            {/* Top Level Input */}
            {user ? (
                <div className="flex gap-3 mb-10">
                    <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden bg-muted">
                        <Image
                            src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                            alt={user.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <form onSubmit={handleAddComment} className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            className="w-full px-4 py-3 pr-12 text-sm border border-border rounded-xl bg-muted/20 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || submitting}
                            className="absolute right-2 top-2 p-1.5 text-primary bg-primary/10 rounded-lg hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:hover:bg-primary/10 disabled:hover:text-primary transition-colors"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="p-4 bg-muted/30 border border-border rounded-xl mb-10 text-center">
                    <p className="text-sm text-foreground mb-3">Join the conversation to leave a comment.</p>
                    <a href="/auth/login" className="text-sm font-semibold text-primary hover:underline">Log in or create an account &rarr;</a>
                </div>
            )}

            {/* Comment List */}
            <div className="space-y-8">
                {comments.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm italic py-8">No comments yet. Be the first to start the conversation!</p>
                ) : (
                    comments.map(c => renderCommentNode(c, false))
                )}
            </div>
        </div>
    );
}
