'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import FeedContainer from "@/components/ui/FeedContainer";
import ProductExplorer from "@/components/ui/ProductExplorer";
import AILookGenerator from "@/components/look/AILookGenerator";
import { Sparkles } from "lucide-react";
import { api } from "@/lib/api";

async function getLooksData() {
  try {
    // Only fetch official (internal) looks for the main feed
    const data = await api.get<any>('/api/looks?isInternal=true');
    return data.looks || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default function Home() {
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [looks, setLooks] = useState<any[]>([]);

  useEffect(() => {
    getLooksData().then(setLooks);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/20 z-10" />
          <Image
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80"
            alt="Fashion Hero"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="relative z-20 text-center px-4 max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white drop-shadow-lg tracking-tight">
              Discover Your Aesthetic.
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium drop-shadow-md pb-4">
              Explore curated full-outfit looks, shop the exact pieces, and build your digital inspiration board.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button variant="creamy" size="lg" className="rounded-full w-full sm:w-auto" asChild>
                <Link href="/looks/create">Create My Look</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAIGenerator(true)}
                className="rounded-full bg-white/10 text-white hover:bg-white hover:text-black border-white/40 w-full sm:w-auto"
              >
                <Sparkles className="w-4 h-4 mr-2" /> Style with AI
              </Button>
            </div>
          </div>
        </section>

        {showAIGenerator && (
          <AILookGenerator
            onClose={() => setShowAIGenerator(false)}
            onSuccess={() => {
              getLooksData().then(setLooks);
              setShowAIGenerator(false);
            }}
          />
        )}

        {/* Categories / Filter Scroller */}
        <section className="bg-white py-6 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {['All Looks', 'Wedding Guest', 'Office Wear', 'Festival', 'Date Night', 'Vacation Resort', 'Streetwear'].map((cat, i) => (
                <button
                  key={cat}
                  className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all-smooth ${i === 0
                    ? 'bg-foreground text-background shadow-md'
                    : 'bg-muted text-foreground hover:bg-secondary hover:shadow-sm'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Feed Container (Explore vs Following tabs) */}
        <FeedContainer initialLooks={looks} />

        {/* Product Explorer */}
        <div className="bg-muted/10 border-t border-border mt-12">
          <ProductExplorer />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <h3 className="font-serif text-3xl font-bold">Aura.</h3>
            <p className="text-background/70 max-w-sm">
              The premier destination for visual fashion discovery and social commerce. Shop complete curated outfit looks.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 font-serif text-xl">Platform</h4>
            <ul className="space-y-2 text-background/70">
              <li><Link href="#" className="hover:text-primary transition-colors">Discover</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Creators</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Trending</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 font-serif text-xl">Company</h4>
            <ul className="space-y-2 text-background/70">
              <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Apply as Seller</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
