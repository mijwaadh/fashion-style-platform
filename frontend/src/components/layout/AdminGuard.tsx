'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, loading, validateToken } = useAuth();
    const router = useRouter();
    const [validating, setValidating] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            console.log('AdminGuard check:', { loading, user: user ? { name: user.name, role: user.role, token: !!user.token } : null });

            if (!loading) {
                if (!user) {
                    console.log('AdminGuard: No user, redirecting to home');
                    router.replace('/');
                    return;
                }

                if (user.role !== 'admin') {
                    console.log('AdminGuard: User not admin, redirecting to home');
                    router.replace('/');
                    return;
                }

                // User exists and has admin role, validate token
                console.log('AdminGuard: Validating token for admin user');
                setValidating(true);
                const isValid = await validateToken();
                setValidating(false);
                
                if (!isValid) {
                    console.log('AdminGuard: Token invalid, redirecting to home');
                    router.replace('/');
                } else {
                    console.log('AdminGuard: Token valid, allowing access');
                }
            }
        };

        checkAuth();
    }, [user, loading, router, validateToken]);

    if (loading || validating) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center p-4">
                <ShieldAlert className="w-16 h-16 text-destructive" />
                <h1 className="text-2xl font-bold font-serif">Access Denied</h1>
                <p className="text-muted-foreground">You do not have permission to access this area.</p>
            </div>
        );
    }

    return <>{children}</>;
}
