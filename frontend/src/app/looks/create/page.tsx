'use client';

import LookBuilder from '@/components/look/LookBuilder';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function CreateLookPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login?redirect=/looks/create');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary/20 mb-4" />
                <p className="text-muted-foreground font-medium animate-pulse">Verifying your style credentials...</p>
            </div>
        );
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-10">
                <h1 className="text-5xl font-serif font-black text-foreground mb-4">Create My Look</h1>
                <p className="text-muted-foreground max-w-2xl text-lg font-medium">
                    Welcome to your digital atelier. Mix, match, and style your perfect outfit to share with the Aura community.
                </p>
            </div>

            <LookBuilder />
        </main>
    );
}
