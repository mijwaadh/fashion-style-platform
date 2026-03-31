'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function ResetPasswordPage() {
    const params = useParams();
    const router = useRouter();
    const { resetPassword } = useAuth();
    const token = params.token as string;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(token, password);
            setSuccess(true);
            setTimeout(() => {
                router.push('/auth/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to reset password. Link may be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
            
            {/* Left Column — Full-height Fashion Image */}
            <div className="hidden md:block relative">
                <Image
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80"
                    alt="New Beginning"
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
                            &ldquo;Fashion is the armor to survive the reality of everyday life.&rdquo;
                        </p>
                        <footer className="mt-3 text-sm font-semibold text-white/70 tracking-wider uppercase">— Bill Cunningham</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Column — Reset Password Form */}
            <div className="flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-24 py-16 bg-background">
                
                {/* Mobile Logo */}
                <div className="md:hidden mb-10">
                    <Link href="/" className="font-serif text-3xl font-bold text-foreground">Aura.</Link>
                </div>

                <div className="max-w-sm w-full mx-auto space-y-8">
                    <div className="space-y-2">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="font-serif text-4xl font-bold text-foreground">Set new password</h1>
                        <p className="text-muted-foreground text-lg">Choose a strong password to protect your aesthetic journey.</p>
                    </div>

                    {success ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                            <div className="flex flex-col items-center text-center gap-4 p-8 bg-emerald-50 border border-emerald-100 rounded-[2rem]">
                                <div className="w-16 h-16 bg-white text-emerald-600 rounded-full shadow-sm flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-xl font-bold text-emerald-900">Password reset!</h3>
                                    <p className="text-emerald-700/80 mt-2">
                                        Your password has been successfully updated. Redirecting you to login...
                                    </p>
                                </div>
                            </div>
                            <Button className="w-full rounded-xl py-6" asChild>
                                <Link href="/auth/login">Login Now</Link>
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

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="password" className="block text-sm font-semibold text-foreground tracking-wide">New Password</label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 border border-border rounded-lg bg-muted/30 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-md"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Minimum 8 characters</p>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-foreground tracking-wide">Confirm Password</label>
                                    <input
                                        id="confirmPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-border rounded-lg bg-muted/30 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-md"
                                    />
                                </div>
                            </div>

                            <Button type="submit" variant="default" size="lg" className="w-full rounded-lg" disabled={loading}>
                                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Resetting...</> : 'Reset Password'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
