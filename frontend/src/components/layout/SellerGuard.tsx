'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface SellerGuardProps {
    children: React.ReactNode;
}

export default function SellerGuard({ children }: SellerGuardProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/auth/login?redirect=' + encodeURIComponent(pathname || '/seller/dashboard'));
                return;
            }

            if (user.role !== 'seller') {
                router.push('/');
                return;
            }

            // Enforce Onboarding
            // If they are a seller but haven't finished onboarding, trap them on the onboarding page
            // @ts-ignore - onboardingCompleted added to User schema via recent update
            if (!user.onboardingCompleted && pathname !== '/seller/onboarding') {
                router.push('/seller/onboarding');
                return;
            }

            // If they ARE onboarded, don't let them go back to the onboarding page
            // @ts-ignore
            if (user.onboardingCompleted && pathname === '/seller/onboarding') {
                router.push('/seller/dashboard');
                return;
            }
        }
    }, [user, loading, router, pathname]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Do not render anything until the correct redirect decision is made
    if (!user || user.role !== 'seller') {
        return null;
    }

    // @ts-ignore
    if (!user.onboardingCompleted && pathname !== '/seller/onboarding') {
        return null; // Prevents flash of dashboard content before redirect
    }

    return <>{children}</>;
}
