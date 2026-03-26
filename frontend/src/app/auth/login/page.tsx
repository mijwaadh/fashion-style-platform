'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, Loader2, ArrowRight, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

type ViewState = 'login' | 'otp';

export default function LoginPage() {
    const router = useRouter();
    const { login, verifyOtp, resendOtp } = useAuth();

    const [view, setView] = useState<ViewState>('login');
    const [otp, setOtp] = useState('');
    const [resending, setResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Email and password are required.');
            return;
        }
        setLoading(true);
        try {
            const res = await login(email, password);
            if (res && res.requiresVerification) {
                // They need to verify. We just show the OTP screen.
                // We do NOT automatically resend here because it implies SMTP wait time 
                // and would invalidate any existing unexpired OTP they are currently trying to type.
                setView('otp');
            } else {
                router.push('/');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit code.');
            return;
        }
        setLoading(true);
        try {
            await verifyOtp(email, otp);
            router.push('/');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Verification failed. Incorrect code.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setResendMessage('');
        setError('');
        try {
            await resendOtp(email);
            setResendMessage('A new code has been sent to your email.');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to resend code.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

            {/* Left Column — Full-height Fashion Image */}
            <div className="hidden md:block relative">
                <Image
                    src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80"
                    alt="Fashion"
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
                            &ldquo;Style is a way to say who you are without having to speak.&rdquo;
                        </p>
                        <footer className="mt-3 text-sm font-semibold text-white/70 tracking-wider uppercase">— Rachel Zoe</footer>
                    </blockquote>
                </div>
            </div>

            {/* Right Column — Login Form */}
            <div className="flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-24 py-16 bg-background">

                {/* Mobile Logo */}
                <div className="md:hidden mb-10">
                    <Link href="/" className="font-serif text-3xl font-bold text-foreground">Aura.</Link>
                </div>

                <div className="max-w-sm w-full mx-auto space-y-8">
                    {view === 'login' ? (
                        <>
                            <div>
                                <h1 className="font-serif text-4xl font-bold text-foreground">Welcome back.</h1>
                                <p className="mt-2 text-muted-foreground text-lg">Sign in to continue curating your aesthetic.</p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-semibold text-foreground tracking-wide">Email Address</label>
                                    <input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 border border-border rounded-lg bg-muted/30 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-md"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="password" className="block text-sm font-semibold text-foreground tracking-wide">Password</label>
                                        <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
                                    </div>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="current-password"
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
                                </div>

                                <Button type="submit" variant="default" size="lg" className="w-full rounded-lg mt-2" disabled={loading}>
                                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</> : 'Sign In'}
                                </Button>
                            </form>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-background text-muted-foreground">or</span>
                                </div>
                            </div>

                            <p className="text-center text-foreground/80">
                                Don&apos;t have an account?{' '}
                                <Link href="/auth/register" className="font-semibold text-foreground hover:text-primary underline underline-offset-4 transition-colors">
                                    Create one
                                </Link>
                            </p>
                        </>
                    ) : (
                        // OTP VERIFICATION VIEW (Imported identically from register)
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-7">
                            <div>
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <AlertCircle className="w-6 h-6 text-primary" />
                                </div>
                                <h1 className="font-serif text-4xl font-bold text-foreground">Verify Email.</h1>
                                <p className="mt-2 text-muted-foreground">
                                    We sent a 6-digit verification code to <strong>{email}</strong>.
                                </p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {resendMessage && (
                                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{resendMessage}</span>
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={handleVerify}>
                                <div>
                                    <label htmlFor="otp" className="block text-sm font-semibold text-foreground tracking-wide mb-2">Verification Code</label>
                                    <input
                                        id="otp"
                                        type="text"
                                        maxLength={6}
                                        placeholder="000000"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} // only allow numbers
                                        className="w-full px-4 py-4 text-center text-3xl tracking-[1em] font-mono border border-border rounded-lg bg-muted/30 text-foreground placeholder-muted-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    />
                                </div>

                                <Button type="submit" variant="default" size="lg" className="w-full rounded-lg" disabled={loading || otp.length !== 6}>
                                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</> : <><ArrowRight className="w-4 h-4 mr-2" /> Verify Account</>}
                                </Button>
                            </form>

                            <div className="text-center pt-4 border-t border-border">
                                <p className="text-muted-foreground text-sm mb-4">Didn&apos;t receive the code?</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-full px-6"
                                    onClick={handleResend}
                                    disabled={resending}
                                >
                                    {resending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</> : <><RefreshCcw className="w-4 h-4 mr-2" /> Resend Code</>}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
