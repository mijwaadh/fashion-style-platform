'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';

export default function VerifyLinkPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const res = await api.get<any>(`/api/auth/verify-link/${token}`);
                
                if (res.token) {
                    // Success! Store user data
                    const userData = {
                        _id: res._id,
                        name: res.name,
                        email: res.email,
                        role: res.role,
                        likedProducts: res.likedProducts || [],
                        likedLooks: res.likedLooks || [],
                        savedLooks: res.savedLooks || [],
                        token: res.token
                    };
                    sessionStorage.setItem('aura_user', JSON.stringify(userData));
                    setStatus('success');
                    setMessage('Verification successful! You are now logged in.');
                } else if (res.isAlreadyVerified) {
                    setStatus('success');
                    setMessage(res.message || 'Your email is already verified.');
                }
            } catch (err: any) {
                console.error('Verification failed', err);
                setStatus('error');
                setMessage(err.response?.data?.message || 'Invalid or expired verification link.');
            }
        };

        if (token) {
            verifyToken();
        }
    }, [token, router]);

    return (
        <div className="min-h-screen flex flex-col bg-[#FDFCFB]">
            <Navbar />
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl shadow-black/5 border border-border p-10 text-center animate-in fade-in zoom-in duration-500">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center">
                            <div className="relative w-20 h-20 mb-6">
                                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <h1 className="text-2xl font-serif font-bold text-foreground mb-2">Verifying...</h1>
                            <p className="text-muted-foreground">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <h1 className="text-3xl font-serif font-bold text-foreground mb-3">Welcome to Aura!</h1>
                            <p className="text-muted-foreground mb-8 text-lg">{message}</p>
                            <Button asChild className="w-full rounded-full h-12 font-bold px-8 shadow-lg shadow-black/5">
                                <button onClick={() => router.push('/')}>
                                    Go to Home <ArrowRight className="ml-2 w-4 h-4" />
                                </button>
                            </Button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                                <XCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <h1 className="text-2xl font-serif font-bold text-foreground mb-3">Verification Failed</h1>
                            <p className="text-muted-foreground mb-8">{message}</p>
                            <div className="flex flex-col gap-3 w-full">
                                <Button asChild variant="outline" className="rounded-full h-12 font-bold border-2">
                                    <button onClick={() => router.push('/auth/login')}>
                                        Back to Login
                                    </button>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
