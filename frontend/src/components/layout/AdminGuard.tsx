'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, loading, validateToken } = useAuth();
    const [hasSynced, setHasSynced] = useState(false);
    const [validating, setValidating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            if (loading || validating) return;

            if (!user) {
                console.log('AdminGuard: No user, redirecting to home');
                router.replace('/');
                return;
            }

            // If user is already an admin, we're good
            if (user.role === 'admin') {
                console.log('AdminGuard: Admin access confirmed');
                return;
            }

            // If user is NOT an admin in local state, try one sync
            if (!hasSynced) {
                console.log('AdminGuard: User role is', user.role, '. Syncing once to check for promotion...');
                setHasSynced(true);
                setValidating(true);
                await validateToken();
                setValidating(false);
            }
            
            // Note: If after sync the role is still not admin, 
            // the component will render the "Access Denied" UI below.
        };

        checkAuth();
    }, [user?.role, user?._id, loading, validating, hasSynced, router, validateToken]);

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
