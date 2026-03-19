'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/layout/Navbar';
import { api } from '@/lib/api';
import { Loader2, Heart, MessageCircle, Bookmark, Share2, Flame, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface Look {
    _id: string;
    videoUrl?: string;
    imageUrl: string;
    title: string;
    description: string;
    isFeatured?: boolean;
    likesCount: number;
    savesCount: number;
    sellerId: {
        _id: string;
        name: string;
        storeName?: string;
        profileImage?: string;
    };
    productsIncluded: any[];
}

function VideoReel({ look, isActive }: { look: Look; isActive: boolean }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { user, updateUser } = useAuth();
    const [isLiked, setIsLiked] = useState(user?.likedLooks?.includes(look._id) || false);
    const [likesCount, setLikesCount] = useState(look.likesCount || 0);

    const [isSaved, setIsSaved] = useState(user?.savedLooks?.includes(look._id) || false);
    const [savesCount, setSavesCount] = useState(look.savesCount || 0);

    // Auto-play / pause based on intersection
    useEffect(() => {
        if (!videoRef.current) return;
        if (isActive) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(e => console.log('Autoplay blocked:', e));
        } else {
            videoRef.current.pause();
        }
    }, [isActive]);

    // Handle Like
    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return toast.error("Please login to like");
        try {
            const res = await api.post<{ isLiked: boolean }>(`/api/looks/${look._id}/toggle-like`, {});
            setIsLiked(res.isLiked);
            setLikesCount(prev => res.isLiked ? prev + 1 : prev - 1);
            let newLiked = [...(user.likedLooks || [])];
            if (res.isLiked) newLiked.push(look._id);
            else newLiked = newLiked.filter(id => id !== look._id);
            updateUser({ likedLooks: newLiked });
        } catch (err) {
            console.error(err);
        }
    };

    // Handle Save
    const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return toast.error("Please login to save");
        try {
            const res = await api.post<{ isSaved: boolean }>(`/api/looks/${look._id}/toggle-save`, {});
            setIsSaved(res.isSaved);
            setSavesCount(prev => res.isSaved ? prev + 1 : prev - 1);
            let newSaved = [...(user.savedLooks || [])];
            if (res.isSaved) newSaved.push(look._id);
            else newSaved = newSaved.filter(id => id !== look._id);
            updateUser({ savedLooks: newSaved });
            toast.success(res.isSaved ? 'Look saved' : 'Removed from saves');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="relative w-full h-full bg-black flex justify-center overflow-hidden">
            {/* Video Player */}
            <video
                ref={videoRef}
                src={look.videoUrl}
                className="w-full h-full object-cover lg:max-w-md lg:rounded-xl lg:my-auto lg:h-[90%] transition-all"
                loop
                muted={false}
                playsInline
                onClick={() => {
                    if (videoRef.current?.paused) videoRef.current.play();
                    else videoRef.current?.pause();
                }}
            />

            {/* Overlays */}
            <div className="absolute inset-0 lg:max-w-md lg:mx-auto pointer-events-none">
                {/* Gradient Bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                {/* Left Side: Info */}
                <div className="absolute bottom-6 flex flex-col items-start px-4 text-white pointer-events-auto max-w-[75%] gap-2">
                    {look.isFeatured && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full text-xs font-black tracking-wider uppercase shadow-lg shadow-orange-500/20 mb-1">
                            <Flame className="w-3.5 h-3.5" /> Featured Reel
                        </div>
                    )}
                    <Link href={`/creator/${look.sellerId._id}`} className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-white/20 border-2 border-white">
                            <Image
                                src={look.sellerId.profileImage || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150'}
                                alt="Creator"
                                width={40} height={40}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        <span className="font-bold text-base drop-shadow-md group-hover:underline">@{look.sellerId.storeName || look.sellerId.name}</span>
                    </Link>

                    <h2 className="font-medium text-sm line-clamp-2 drop-shadow-md">{look.title}</h2>
                    <p className="text-xs text-white/80 line-clamp-2 drop-shadow-sm">{look.description}</p>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="absolute bottom-6 right-2 flex flex-col items-center gap-5 pointer-events-auto">
                    {/* View Details / Shop Link */}
                    <div className="relative group flex items-center justify-center">
                        <Link href={`/look/${look._id}`} className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all overflow-hidden relative shadow-lg">
                             <Image src={look.imageUrl} alt="thumbnail" fill className="object-cover opacity-60 mix-blend-overlay" />
                             <ShoppingBag className="w-6 h-6 text-white drop-shadow-md z-10" />
                        </Link>
                        {look.productsIncluded?.length > 0 && (
                             <span className="absolute -top-2 -right-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-background">
                                 {look.productsIncluded.length}
                             </span>
                        )}
                        <span className="text-white text-[10px] font-bold mt-1 drop-shadow-md self-center absolute -bottom-5">Shop</span>
                    </div>

                    <button onClick={handleLike} className="group flex flex-col items-center gap-1 transition-transform active:scale-90">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-colors ${isLiked ? 'bg-rose-500/20 text-rose-500' : 'text-white'}`}>
                            <Heart className={`w-7 h-7 ${isLiked ? 'fill-current' : ''}`} />
                        </div>
                        <span className="text-white text-[11px] font-bold drop-shadow-md">{likesCount}</span>
                    </button>

                    <Link href={`/look/${look._id}`} className="group flex flex-col items-center gap-1 transition-transform active:scale-90">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white">
                            <MessageCircle className="w-7 h-7" />
                        </div>
                        <span className="text-white text-[11px] font-bold drop-shadow-md">Comment</span>
                    </Link>

                    <button onClick={handleSave} className="group flex flex-col items-center gap-1 transition-transform active:scale-90">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-colors ${isSaved ? 'bg-primary/20 text-primary' : 'text-white'}`}>
                            <Bookmark className={`w-7 h-7 ${isSaved ? 'fill-current' : ''}`} />
                        </div>
                        <span className="text-white text-[11px] font-bold drop-shadow-md">{savesCount}</span>
                    </button>

                    <button className="group flex flex-col items-center gap-1 transition-transform active:scale-90">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white">
                            <Share2 className="w-7 h-7" />
                        </div>
                        <span className="text-white text-[11px] font-bold drop-shadow-md">Share</span>
                    </button>
                    
                </div>
            </div>
        </div>
    );
}

export default function ReelsPage() {
    const [looks, setLooks] = useState<Look[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const fetchReels = async () => {
            try {
                // Fetch looks, sorting handles featured > trending logic on backend
                const data = await api.get<any>('/api/looks?limit=30');
                // Filter only to looks that have a videoUrl attached.
                const videoLooks = (data?.looks || []).filter((l: Look) => !!l.videoUrl);
                setLooks(videoLooks);
            } catch (error) {
                console.error("Failed to load reels", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReels();
    }, []);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const scrollPosition = container.scrollTop;
        const index = Math.round(scrollPosition / container.clientHeight);
        if (index !== activeIndex) {
            setActiveIndex(index);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-black">
            {/* Overlay Navbar for maximum immersion */}
            <div className="fixed top-0 left-0 right-0 z-50">
                <Navbar />
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
            ) : looks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-white/50 space-y-4">
                    <p>No creator reels available yet.</p>
                    <Link href="/explore" className="text-primary hover:underline">Go to Explore</Link>
                </div>
            ) : (
                <div 
                    className="flex-1 snap-y snap-mandatory overflow-y-scroll overflow-x-hidden no-scrollbar h-[100dvh]" 
                    onScroll={handleScroll}
                >
                    {/* Add a spacer because the fixed navbar is 80px high, but we actually want full bleed, so we don't need a spacer if the nav is transparent. But our Nav is blurred background right now. */}
                    {looks.map((look, index) => (
                        <div key={look._id} className="snap-start snap-always w-full h-[100dvh] pt-20 bg-black">
                            <VideoReel look={look} isActive={index === activeIndex} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
