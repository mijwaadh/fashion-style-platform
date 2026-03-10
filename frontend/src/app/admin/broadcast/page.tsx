'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import AdminGuard from '@/components/layout/AdminGuard';
import Navbar from '@/components/layout/Navbar';
import { Send, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function BroadcastContent() {
    const [message, setMessage] = useState('');
    const [targetRole, setTargetRole] = useState<'all' | 'user' | 'seller'>('all');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsLoading(true);
        setStatus(null);

        try {
            const res = await api.post<{ message: string, count: number }>('/api/admin/notifications/broadcast', {
                message,
                targetRole
            });
            setStatus({ type: 'success', text: `Success! Sent to ${res.count} users.` });
            setMessage(''); // Clear on success
        } catch (error: any) {
            console.error('Broadcast error:', error);
            setStatus({ type: 'error', text: error.response?.data?.message || 'Failed to send broadcast.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            <Navbar />

            <main className="max-w-3xl mx-auto px-4 mt-8 md:mt-12">
                <Link href="/admin" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                </Link>

                <div className="mb-8">
                    <h1 className="font-serif text-3xl font-bold text-foreground">Broadcast Message</h1>
                    <p className="text-muted-foreground mt-2">
                        Send a system-wide notification to users on the platform.
                    </p>
                </div>

                <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
                    <form onSubmit={handleSend} className="p-6 md:p-8 space-y-6">

                        {/* Target Audience Select */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">Target Audience</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['all', 'user', 'seller'].map(role => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => setTargetRole(role as any)}
                                        className={`py-3 px-4 rounded-xl border text-sm font-medium capitalize transition-all ${targetRole === role
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border hover:border-border/80 text-muted-foreground'
                                            }`}
                                    >
                                        {role === 'all' ? 'Everyone' : role + 's'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Message Input */}
                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-semibold text-foreground">Message</label>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="E.g., Welcome to our new summer collection!"
                                rows={5}
                                className="w-full rounded-xl border-border bg-background focus:ring-primary focus:border-primary resize-none placeholder:text-muted-foreground/50 transition-colors"
                                required
                            />
                            <p className="text-xs text-muted-foreground text-right w-full block">
                                Keep it concise. Users will see this in their notification dropdown.
                            </p>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className={`p-4 rounded-xl text-sm font-medium ${status.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
                                }`}>
                                {status.text}
                            </div>
                        )}

                        {/* Submit */}
                        <div className="pt-2">
                            <button
                                disabled={isLoading || !message.trim()}
                                type="submit"
                                className="w-full py-3.5 px-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send Broadcast
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </main>
        </div>
    );
}

export default function AdminBroadcastPage() {
    return (
        <AdminGuard>
            <BroadcastContent />
        </AdminGuard>
    );
}
