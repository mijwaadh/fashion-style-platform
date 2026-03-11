import { notFound } from 'next/navigation';
import CreatorProfileClient from './CreatorProfileClient';

async function getCreatorProfile(id: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/public/${id}`, { cache: 'no-store' });
        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error('Failed to fetch profile');
        }
        return await res.json();
    } catch (error) {
        console.error("Fetch exception in getCreatorProfile:", error);
        return null; // Handle gracefully
    }
}

export default async function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getCreatorProfile(id);

    if (!data) {
        return notFound();
    }

    return <CreatorProfileClient profileData={data} id={id} />;
}
