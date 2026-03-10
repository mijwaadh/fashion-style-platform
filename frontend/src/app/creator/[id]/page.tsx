import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CheckCircle2, MapPin } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import LookCard from '@/components/ui/LookCard';
import FollowButton, { FollowerCount } from '@/components/ui/FollowButton';

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

export default async function CreatorProfile({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getCreatorProfile(id);

    if (!data) {
        return notFound();
    }

    const { profile, looks } = data;
    const coverImage = "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80";
    const avatar = profile.profileImage || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250";

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <main className="flex-1 w-full pb-20">
                {/* Cover Image */}
                <div className="relative w-full h-64 md:h-80 lg:h-96">
                    <Image
                        src={coverImage}
                        alt="Cover"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-32 relative z-10 w-full mb-16">
                    {/* Profile Header Card */}
                    <div className="bg-background rounded-3xl p-6 sm:p-10 shadow-xl border border-border flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                        {/* Avatar */}
                        <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-background bg-muted shrink-0 shadow-sm">
                            <Image src={avatar} alt={profile.name} fill className="object-cover" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-4 w-full">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                                <div>
                                    <h1 className="flex items-center justify-center md:justify-start gap-2 text-3xl sm:text-4xl font-serif font-bold text-foreground">
                                        {profile.name}
                                        {profile.isVerifiedSeller && <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />}
                                    </h1>
                                    <p className="text-muted-foreground font-medium text-lg mt-1">{profile.storeName}</p>
                                </div>
                                <div className="w-full md:w-auto flex flex-col gap-3 shrink-0">
                                    <FollowButton targetId={id} initialFollowers={profile.followersCount} />
                                </div>
                            </div>

                            <p className="text-foreground/80 leading-relaxed max-w-2xl text-lg mx-auto md:mx-0">
                                {profile.bio || "Creator on Aura."}
                            </p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-3 gap-x-6 text-sm text-muted-foreground font-medium pt-2">
                                <div className="flex gap-4 items-center">
                                    <span className="text-foreground"><strong className="text-lg mr-1"><FollowerCount targetId={id} initialCount={profile.followersCount} /></strong>followers</span>
                                    <span className="text-foreground"><strong className="text-lg mr-1">{profile.followingCount}</strong>following</span>
                                </div>
                                <div className="hidden sm:block w-1 h-1 rounded-full bg-border" />
                                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />Global</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs / Filters */}
                    <div className="mt-12 flex items-center justify-center md:justify-start gap-6 border-b border-border">
                        <button className="pb-4 font-semibold text-foreground border-b-2 border-primary text-lg">Looks ({looks.length})</button>
                    </div>

                    {/* Looks Grid */}
                    {looks.length > 0 ? (
                        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                            {looks.map((look: any) => (
                                <LookCard
                                    key={look._id}
                                    id={look._id}
                                    title={look.title}
                                    imageUrl={look.imageUrl}
                                    sellerName={profile.storeName || profile.name}
                                    sellerAvatar={avatar}
                                    occasion={look.occasion?.[0] || 'Style'}
                                    budgetRange={look.budgetRange}
                                    saves={look.savesCount || 0}
                                    views={look.viewsCount || 0}
                                    likes={look.likesCount || 0}
                                    products={look.productsIncluded}
                                    layoutMetadata={look.layoutMetadata}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 mt-8 mb-20 bg-background rounded-2xl border border-dashed border-border">
                            <p className="text-muted-foreground">This creator hasn&apos;t published any looks yet.</p>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
