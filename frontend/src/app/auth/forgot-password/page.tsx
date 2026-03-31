'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email) {
            setError('Please enter your email address.');
            return;
        }
        setLoading(true);
        try {
            await forgotPassword(email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
            
            {/* Left Column — Full-height Fashion Image */}
            <div className="hidden md:block relative">
                <Image
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80"
                    alt="Reset Password"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/30 flex flex-col justify-between p-12">
                    <Link href="/" className="font-serif text-4xl font-bold text-white tracking-tight">
                        Aura.
                    </Link>
                    <blockquote className="text-white/90">
                        <p className="font-serif text-2xl italic leading-relaxed">
                            &ldquo;Confidence. If you have it, you can make anything look good.&rdquo;
                        </p>
                        <footer className="mt-3 text-sm font-semibold text-white/70 tracking-wider uppercase">— Diane von Furstenberg</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Column — Forgot Password Form */}
            <div className="flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-24 py-16 bg-background">
                
                {/* Mobile Logo */}
                <div className="md:hidden mb-10">
                    <Link href="/" className="font-serif text-3xl font-bold text-foreground">Aura.</Link>
                </div>

                <div className="max-w-sm w-full mx-auto space-y-8">
                    <div className="space-y-2">
                        <Link href="/auth/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4 group">
                            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to login
                        </Link>
                        <h1 className="font-serif text-4xl font-bold text-foreground">Forgot password?</h1>
                        <p className="text-muted-foreground text-lg">No worries, we&apos;ll send you reset instructions.</p>
                    </div>

                    {success ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                            <div className="flex flex-col items-center text-center gap-4 p-8 bg-zinc-50 border border-zinc-100 rounded-[2rem]">
                                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-xl font-bold text-zinc-900">Check your email</h3>
                                    <p className="text-zinc-500 mt-2">
                                        We sent a password reset link to <br/>
                                        <strong className="text-zinc-900 font-mono tracking-tight">{email}</strong>
                                    </p>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full rounded-xl py-6" asChild>
                                <Link href="/auth/login">Back to Login</Link>
                            </Button>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-semibold text-foreground tracking-wide">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-border rounded-lg bg-muted/30 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-md"
                                />
                            </div>

                            <Button type="submit" variant="default" size="lg" className="w-full rounded-lg" disabled={loading}>
                                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : 'Send Reset Link'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
