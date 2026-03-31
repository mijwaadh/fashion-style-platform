'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShoppingBag, User, AlertCircle, Loader2, ArrowRight, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

type Role = 'user';
type ViewState = 'register' | 'otp';

export default function RegisterPage() {
    const router = useRouter();
    const { register, verifyOtp, resendOtp } = useAuth();

    const [view, setView] = useState<ViewState>('register');
    const [otp, setOtp] = useState('');
    const [resending, setResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [role, setRole] = useState<Role>('user');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name || !email || !password) {
            setError('Please fill in all required fields.');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        setLoading(true);
        try {
            const res = await register(name, email, password, role, undefined);
            if (res && res.requiresVerification) {
                setView('otp');
            } else {
                // Fallback if requiresVerification is missing
                router.push('/');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
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

            {/* Left Column — Fashion Image */}
            <div className="hidden md:block relative">
                <Image
                    src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80"
                    alt="Fashion"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/30 flex flex-col justify-between p-12">
                    <Link href="/" className="font-serif text-4xl font-bold text-white tracking-tight">
                        Aura.
                    </Link>
                    <div className="space-y-3">
                        <h2 className="font-serif text-3xl font-bold text-white">Join the Community.</h2>
                        <p className="text-white/80 text-lg leading-relaxed">
                            Discover thousands of curated outfit looks, follow your favorite creators, and shop the exact pieces effortlessly.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column — Register Form */}
            <div className="flex flex-col justify-center px-6 sm:px-10 md:px-14 lg:px-20 py-16 bg-background overflow-y-auto">

                <div className="md:hidden mb-10">
                    <Link href="/" className="font-serif text-3xl font-bold text-foreground">Aura.</Link>
                </div>

                <div className="max-w-sm w-full mx-auto space-y-7">
                    {view === 'register' ? (
                        <>
                            <div>
                                <h1 className="font-serif text-4xl font-bold text-foreground">Create Account.</h1>
                                <p className="mt-2 text-muted-foreground">Your next favorite look is waiting.</p>
                            </div>

                            {/* Role Selection */}
                            <div>
                                <p className="text-sm font-semibold text-foreground mb-3 tracking-wide">I am joining as a...</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {(['user'] as Role[]).map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRole(r)}
                                            className={cn(
                                                "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all-smooth font-medium capitalize",
                                                role === r
                                                    ? "border-foreground bg-foreground text-background shadow-md"
                                                    : "border-border bg-muted/30 text-foreground hover:border-foreground/40"
                                            )}
                                        >
                                            {r === 'user' ? <User className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                                            {r === 'user' ? 'Shopper' : 'Shopper'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <label htmlFor="name" className="block text-sm font-semibold text-foreground tracking-wide">Full Name</label>
                                    <input id="name" type="text" placeholder="e.g. Sarah Jenkins"
                                        value={name} onChange={e => setName(e.target.value)}
                                        className="w-full px-4 py-3 border border-border rounded-lg bg-muted/30 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-semibold text-foreground tracking-wide">Email Address</label>
                                    <input id="email" type="email" placeholder="you@example.com"
                                        value={email} onChange={e => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 border border-border rounded-lg bg-muted/30 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="password" className="block text-sm font-semibold text-foreground tracking-wide">Password</label>
                                    <div className="relative">
                                        <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters"
                                            value={password} onChange={e => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 border border-border rounded-lg bg-muted/30 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all pr-12"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <Button type="submit" variant="default" size="lg" className="w-full rounded-lg mt-2" disabled={loading}>
                                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating Account...</> : 'Create Account'}
                                </Button>
                            </form>

                            <p className="text-center text-sm text-muted-foreground">
                                By creating an account, you agree to our{' '}
                                <Link href="/terms" className="underline text-foreground hover:text-primary">Terms</Link>
                                {' '}and{' '}
                                <Link href="/privacy" className="underline text-foreground hover:text-primary">Privacy Policy</Link>.
                            </p>

                            <p className="text-center text-foreground/80">
                                Already have an account?{' '}
                                <Link href="/auth/login" className="font-semibold text-foreground hover:text-primary underline underline-offset-4">
                                    Sign in
                                </Link>
                            </p>
                        </>
                    ) : (
                        // OTP VERIFICATION VIEW
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
