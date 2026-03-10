'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bell, Heart, MessageCircle, UserPlus, Check, Loader2, Info, Bookmark } from 'lucide-react';
import { api } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';

interface NotificationType {
    _id: string;
    type: 'follow' | 'comment' | 'save' | 'system' | 'like';
    isRead: boolean;
    createdAt: string;
    message?: string;
    senderId: {
        _id: string;
        name: string;
        profileImage?: string;
        storeName?: string;
    };
    relatedLookId?: {
        _id: string;
        title: string;
        imageUrl: string;
    };
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const data = await api.get<NotificationType[]>('/api/notifications');
            setNotifications(data);
        } catch (error) {
            console.error('Failed to load notifications', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        try {
            await api.put(`/api/notifications/${id}/read`, {});
        } catch (error) {
            console.error('Failed to mark read', error);
            // Revert (simplified)
            fetchNotifications();
        }
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        try {
            await api.put('/api/notifications/read-all', {});
        } catch (error) {
            console.error('Failed to mark all read', error);
            fetchNotifications();
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'follow': return <UserPlus className="w-5 h-5 text-blue-500" />;
            case 'comment': return <MessageCircle className="w-5 h-5 text-green-500" />;
            case 'save': return <Bookmark className="w-5 h-5 text-primary" />;
            case 'like': return <Heart className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-muted-foreground" />;
        }
    };

    const getMessage = (notification: NotificationType) => {
        const name = notification.senderId?.storeName || notification.senderId?.name || 'Someone';
        switch (notification.type) {
            case 'follow': return <span><span className="font-semibold">{name}</span> started following you.</span>;
            case 'save': return <span><span className="font-semibold">{name}</span> saved your look.</span>;
            case 'like': return <span><span className="font-semibold">{name}</span> liked your look.</span>;
            case 'comment': return <span><span className="font-semibold">{name}</span> {notification.message || 'commented on your look.'}</span>;
            case 'system': return <span>{notification.message}</span>;
            default: return <span>New notification from {name}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            <Navbar />

            <main className="max-w-3xl mx-auto px-4 mt-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="font-serif text-3xl font-bold flex items-center gap-3">
                        <Bell className="w-8 h-8 text-primary" />
                        Notifications
                    </h1>
                    {notifications.some(n => !n.isRead) && (
                        <Button variant="outline" size="sm" onClick={markAllAsRead} className="rounded-full">
                            <Check className="w-4 h-4 mr-2" /> Mark all as read
                        </Button>
                    )}
                </div>

                <div className="bg-background rounded-3xl border border-border shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="w-8 h-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-1">You&apos;re all caught up!</h3>
                            <p className="text-sm text-muted-foreground">No new notifications to display right now.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map(notif => (
                                <div
                                    key={notif._id}
                                    className={`flex items-start gap-4 p-4 lg:p-6 transition-colors hover:bg-muted/30 ${!notif.isRead ? 'bg-primary/5' : ''}`}
                                    onClick={() => !notif.isRead && markAsRead(notif._id)}
                                >
                                    {/* Icon & Avatar Status */}
                                    <div className="relative shrink-0">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary">
                                            {notif.senderId?.profileImage ? (
                                                <Image src={notif.senderId.profileImage} alt="User" fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-bold text-muted-foreground uppercase">
                                                    {notif.senderId?.name?.charAt(0) || '?'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full border-2 border-background flex items-center justify-center shadow-sm">
                                            {getIcon(notif.type)}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pt-1">
                                        <p className="text-sm text-foreground leading-relaxed pr-8">
                                            {getMessage(notif)}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1 font-medium">
                                            {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    {/* Related Look Thumbnail */}
                                    {notif.relatedLookId && (
                                        <Link href={`/look/${notif.relatedLookId._id}`} className="shrink-0 group">
                                            <div className="w-12 h-16 rounded overflow-hidden bg-secondary relative border border-border group-hover:border-primary transition-colors">
                                                <Image src={notif.relatedLookId.imageUrl} alt="Look preview" fill className="object-cover" />
                                            </div>
                                        </Link>
                                    )}

                                    {/* Read Status Dot */}
                                    {!notif.isRead && (
                                        <div className="w-2.5 h-2.5 bg-primary rounded-full shrink-0 mt-3 absolute right-6"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
