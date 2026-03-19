import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Bookmark, Share2, Eye, ShieldCheck, ExternalLink, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SaveToCollectionModal from '@/components/ui/SaveToCollectionModal';
import FollowButton, { FollowerCount } from '@/components/ui/FollowButton';
import CommentSection from '@/components/CommentSection';
import TaggedProductCard from '@/components/look/TaggedProductCard';
import SimilarLookProducts from '@/components/look/SimilarLookProducts';
import LikeButton from '@/components/ui/LikeButton';

// Fetch the look data directly on the server
async function getLook(id: string) {
    try {
        console.log(`Fetching look from: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/looks/${id}`);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/looks/${id}`, { cache: 'no-store' });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Error fetching look ${id}: Status ${res.status}, Body: ${errorText}`);
            if (res.status === 404) return null;
            throw new Error(`Failed to fetch look: ${res.status} ${errorText}`);
        }
        return await res.json();
    } catch (error) {
        console.error("Fetch exception in getLook:", error);
        return null;
    }
}

export default async function LookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const look = await getLook(id);

    if (!look) {
        return notFound();
    }

    const sellerName = look.sellerId?.storeName || look.sellerId?.name || "Aura Creator";
    const sellerAvatar = look.sellerId?.profileImage || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150";
    const isVerified = look.sellerId?.isVerifiedSeller || false;

    // Flatten products to unwrap { product: P, matchType: T } from the new schema
    const flattenedProducts = (look.productsIncluded || []).map((p: any) => {
        if (p.product && typeof p.product === 'object') {
            return {
                ...p.product,
                matchType: p.matchType || 'exact'
            };
        }
        return p; 
    }).filter((p: any) => p && p.price !== undefined);

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            {/* Header / Nav */}
            <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="hidden sm:inline">Back to Feed</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground">
                            <Share2 className="w-5 h-5" />
                        </Button>
                        <div className="h-8 w-px bg-border mx-1" />
                        <LikeButton lookId={look._id.toString()} initialLikes={look.likesCount || 0} />
                        <SaveToCollectionModal lookId={look._id.toString()} initialSaves={look.savesCount || 0} />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 mt-6 md:mt-10">
                <div className="bg-background rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col md:flex-row">

                    {/* Left Side: The Massive Image */}
                    <div className="w-full md:w-1/2 lg:w-[55%] relative flex items-center justify-center bg-[#F9F9F7] min-h-[60vh] md:h-[85vh] overflow-hidden border-r border-border/50">
                        <div className="relative h-full aspect-[3/4] max-w-full flex items-center justify-center">
                            {!look.layoutMetadata || Object.keys(look.layoutMetadata).length === 0 ? (
                                look.videoUrl ? (
                                   <video
                                        src={look.videoUrl}
                                        autoPlay
                                        loop
                                        muted
                                        controls
                                        playsInline
                                        className="w-full h-full object-cover"
                                   />
                                ) : (
                                    <Image
                                        src={look.imageUrl}
                                        alt={look.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                                        className="object-contain p-4 md:p-0"
                                        priority
                                    />
                                )
                            ) : (
                                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                                    {/* Visual Composition Restoration (High Fidelity) */}
                                    <div className="absolute inset-0 bg-transparent">
                                        {flattenedProducts.map((p: any) => {
                                            const meta = look.layoutMetadata[p._id];
                                            if (!meta) return null;

                                            const isPercentage = typeof meta.x === 'number' && meta.x <= 100 && meta.y <= 100;
                                            const left = isPercentage ? `${meta.x}%` : `${meta.x}px`;
                                            const top = isPercentage ? `${meta.y}%` : `${meta.y}px`;

                                            return (
                                                <div
                                                    key={p._id}
                                                    className="absolute transform-gpu drop-shadow-2xl"
                                                    style={{
                                                        left,
                                                        top,
                                                        zIndex: meta.zIndex,
                                                        width: '40%', // Consistent scaling
                                                        aspectRatio: '3/4',
                                                        transform: `scale(${meta.scale})`,
                                                        transformOrigin: 'top left',
                                                        filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.12))'
                                                    }}
                                                >
                                                    <Image
                                                        src={p.imageUrl}
                                                        alt={p.name}
                                                        fill
                                                        className="object-contain"
                                                        sizes="400px"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {/* Overlay Gradient for readability on mobile */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
                        </div>
                    </div>

                    {/* Right Side: Details & Shoppable Products */}
                    <div className="w-full md:w-1/2 lg:w-[45%] flex flex-col h-full max-h-none md:max-h-[85vh] overflow-y-auto custom-scrollbar">
                        <div className="p-6 md:p-8 flex-1">

                            {/* Creator Profile snippet */}
                            <div className="flex items-center justify-between mb-6">
                                <Link href={`/creator/${look.sellerId?._id}`} className="flex items-center gap-3 group">
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors">
                                        <Image src={sellerAvatar} alt={sellerName} fill sizes="48px" className="object-cover" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{sellerName}</span>
                                            {isVerified && <ShieldCheck className="w-4 h-4 text-primary" />}
                                        </div>
                                        <p className="text-xs text-muted-foreground"><FollowerCount targetId={look.sellerId?._id?.toString() || ''} initialCount={look.sellerId?.followers?.length || 0} /> Followers</p>
                                    </div>
                                </Link>
                                {look.sellerId?._id && (
                                    <div className="w-28 sm:w-auto">
                                        <FollowButton targetId={look.sellerId._id.toString()} initialFollowers={look.sellerId?.followers?.length || 0} />
                                    </div>
                                )}
                            </div>

                            {/* Look Title & Description */}
                            <h1 className="font-serif text-3xl font-bold text-foreground mb-3 leading-tight">{look.title}</h1>
                            <p className="text-muted-foreground mb-6 whitespace-pre-line leading-relaxed">
                                {look.description || "No styling notes provided for this look."}
                            </p>

                            {/* Metadata Badges */}
                            <div className="flex flex-wrap items-center gap-2 mb-8 pb-8 border-b border-border">
                                {look.occasion?.map((occ: string) => (
                                    <Badge key={occ} variant="creamy" className="capitalize">{occ}</Badge>
                                ))}
                                <Badge variant="outline" className="capitalize">{look.gender || 'universal'}</Badge>
                                <Badge variant="secondary" className="capitalize">{look.budgetRange} budget</Badge>

                                <div className="ml-auto flex items-center gap-4 text-sm text-muted-foreground font-medium">
                                    <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {look.viewsCount || 0}</span>
                                    <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-red-500 fill-red-500/10" /> {look.likesCount || 0}</span>
                                    <span className="flex items-center gap-1.5"><Bookmark className="w-4 h-4 text-primary fill-primary/10" /> {look.savesCount || 0}</span>
                                </div>
                            </div>

                            {/* Tagged Products Section */}
                                <div>
                                    <h2 className="font-serif text-xl font-bold text-foreground mb-4">Shop This Look</h2>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        {flattenedProducts.length} items featured. Total value: <strong className="text-foreground">₹{look.totalEstimatedBudget?.toFixed(2) || '0.00'}</strong>
                                    </p>

                                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x -mx-2 px-2">
                                    {flattenedProducts.length > 0 ? (
                                        flattenedProducts.map((product: any) => (
                                            <div key={product._id} className="min-w-[280px] sm:min-w-[320px] snap-start">
                                                <TaggedProductCard product={product} />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="w-full p-6 border-2 border-dashed border-border rounded-xl text-center text-muted-foreground text-sm">
                                            No products were tagged in this look.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* --- COMMENT SECTION --- */}
                            <CommentSection lookId={look._id.toString()} />

                            <div className="mt-12 text-center pb-4">
                                <p className="text-xs text-muted-foreground">Aura Fashion Platform © 2024</p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
