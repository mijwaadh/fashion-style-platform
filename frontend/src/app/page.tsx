'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import FeedContainer from "@/components/ui/FeedContainer";
import ProductExplorer from "@/components/ui/ProductExplorer";
import AILookGenerator from "@/components/look/AILookGenerator";
import { Sparkles, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";

async function getLooksData() {
  try {
    const data = await api.get<any>('/api/looks?trending=true');
    return data.looks || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

const faqs = [
  {
    question: "What is Gramkart?",
    answer: "Gramkart is India's creator-driven fashion platform where fashion influencers, stylists, and creators showcase how they style products in engaging short-form reels. Watch real creators styling real products for weddings, office wear, festivals, dates, and everyday occasions. Then shop the complete outfit or individual pieces directly from the video. It's TikTok meets fashion shopping."
  },
  {
    question: "How do I find outfit ideas for specific occasions on Gramkart?",
    answer: "Browse our Reels section by occasion (Wedding Guest, Office Wear, Date Night, Festival, etc.). Watch creators styling complete outfits in short videos. Each reel shows exact product details, pricing, and links. Click to shop the complete look or individual pieces from the creators' selections."
  },
  {
    question: "Can I become a creator and earn on Gramkart?",
    answer: "Yes! Gramkart is built for creators. If you have style expertise, film yourself styling products in reels, post them on our platform, and earn commissions when followers buy through your links. The more engaging your styling reels, the more you earn."
  },
  {
    question: "What makes Gramkart different from Instagram or TikTok?",
    answer: "Unlike regular social media, every product in Gramkart reels is shoppable. You're not just watching influencers—you're directly buying from the exact products they styled. No hunting through links or comments. One-click shopping from the reel itself."
  },
  {
    question: "Can I shop complete outfits or do I have to buy individual items?",
    answer: "Both! Every styling reel shows the complete outfit. You can buy the entire look with one click (we bundle them), or pick and choose individual pieces you love. Creators show pricing for each item so you know exactly what you're buying."
  },
  {
    question: "How does payment and shipping work?",
    answer: "Shipping and payment vary by creator/seller. Each reel shows the pricing, shipping options, and seller details. Complete the purchase through the app or website. Track your orders in real-time."
  }
];

export default function Home() {
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [looks, setLooks] = useState<any[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    getLooksData().then(setLooks);
  }, []);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/20 z-10" />
          <Image
            src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80"
            alt="Shop curated fashion styling looks for weddings, office wear, and festivals in India"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="relative z-20 text-center px-4 max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white drop-shadow-lg tracking-tight">
              Watch Creators Style. Shop Complete Looks.
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium drop-shadow-md pb-4">
              Watch fashion creators styling real products in trending reels for weddings, office wear, festivals, and dates. Shop the complete outfit or individual pieces directly from the video.
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

        {/* About Gramkart Section */}
        <section className="bg-white py-12 md:py-16 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-center">What is Gramkart?</h2>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                Gramkart is India's creator-powered fashion platform where real fashion influencers, stylists, and creators showcase how they style products in short-form reels. Instead of static product images, watch engaging videos of creators styling complete outfits for every occasion—weddings, office wear, festivals, dates, weekends, and more. The difference? Every product is shoppable.
              </p>
              <p>
                Our mission is simple: Connect creators with fashion-conscious shoppers through authentic, engaging video content. Creators get a platform to showcase their styling expertise and earn commissions. Shoppers get real-world outfit inspiration from people they trust, with one-click shopping for complete looks or individual pieces. It's TikTok, Instagram Reels, and a fashion marketplace all in one.
              </p>
              <p>
                No more endless scrolling through product pages. No more wondering if that dress will actually look good. Watch a creator style it in a reel, see how it moves, how it pairs with other items, and buy it immediately. That's the Gramkart difference.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-gray-50 py-12 md:py-16 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">How Gramkart Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-4xl font-bold text-primary mb-4">1</div>
                <h3 className="text-xl font-bold mb-4">Watch Creator Reels</h3>
                <p className="text-gray-700">Browse short-form videos where fashion creators style complete outfits. Watch them for weddings, office wear, festivals, dates, weekends, and everyday occasions. See real styling in action.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-4xl font-bold text-primary mb-4">2</div>
                <h3 className="text-xl font-bold mb-4">Get Exact Details</h3>
                <p className="text-gray-700">Every reel shows complete outfit breakdown: product names, images, prices, and direct links to each item. Know exactly what the creator wore and how much it costs.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-4xl font-bold text-primary mb-4">3</div>
                <h3 className="text-xl font-bold mb-4">Buy Complete or Mix</h3>
                <p className="text-gray-700">Shop the entire outfit with one click, or pick individual pieces you love. Each product is directly shoppable from the creator's reel. Follow creators for consistent inspiration.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Gramkart Section */}
        <section className="bg-white py-12 md:py-16 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-center">Why Choose Gramkart?</h2>
            <ul className="space-y-4 text-lg text-gray-700">
              <li className="flex gap-4">
                <span className="text-2xl text-primary font-bold min-w-fit">✓</span>
                <span><strong>Real Creators, Real Styling:</strong> Watch actual fashion influencers and stylists wearing and styling the products. No models or stock photos—real people, real outfits, real reviews through video.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-2xl text-primary font-bold min-w-fit">✓</span>
                <span><strong>Authentic Engagement:</strong> See how products actually move, fit, and look in real-world scenarios. Video is more trustworthy than any product description.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-2xl text-primary font-bold min-w-fit">✓</span>
                <span><strong>One-Click Shopping:</strong> Every product in a reel is shoppable. No hunting through links or comments. Buy the complete look or individual pieces instantly.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-2xl text-primary font-bold min-w-fit">✓</span>
                <span><strong>Support Indian Creators:</strong> Support independent fashion creators, stylists, designers, and influencers. Your purchases directly benefit creators who inspire you.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-2xl text-primary font-bold min-w-fit">✓</span>
                <span><strong>Follow Your Favorites:</strong> Build your own feed by following creators whose style you love. Get consistent inspiration from people who get how you want to dress.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-2xl text-primary font-bold min-w-fit">✓</span>
                <span><strong>Transparent Pricing:</strong> Every product shows exact price upfront. No surprises. See the complete cost before you decide to buy.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Categories / Filter Scroller */}
        <section className="bg-white py-6 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Shop by Occasion</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {['All Looks', 'Wedding Guest', 'Office Wear', 'Festival', 'Date Night', 'Vacation Resort', 'Streetwear'].map((cat, i) => (
                <button
                  key={cat}
                  className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all-smooth ${i === 0
                    ? 'bg-foreground text-background shadow-md'
                    : 'bg-muted text-foreground hover:bg-secondary hover:shadow-sm'
                    }`}
                  title={`Browse ${cat.toLowerCase()} outfit looks and styling ideas`}
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

        {/* FAQ Section */}
        <section className="bg-white py-12 md:py-16 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border border-border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                  <button
                    className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    aria-expanded={expandedFaq === index}
                  >
                    <h3 className="text-lg font-semibold text-left text-gray-900">{faq.question}</h3>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform flex-shrink-0 ml-4 ${expandedFaq === index ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-border">
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Seller CTA Section */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12 md:py-16 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Become a Creator on Gramkart</h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Are you a fashion influencer, stylist, designer, or style enthusiast? Create styling reels on Gramkart, build your audience, and earn commissions every time someone buys from your videos. Showcase your styling expertise video by video.
            </p>
            <Button size="lg" className="rounded-full" asChild>
              <Link href="/seller/dashboard">Join as Creator</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <h3 className="font-serif text-3xl font-bold">Gramkart</h3>
            <p className="text-background/70 max-w-sm">
              India's creator-powered fashion platform. Watch fashion influencers style real products in engaging reels. Shop complete outfits or individual pieces directly from the video.
            </p>
            <div className="text-sm text-background/60 pt-4">
              <p>📍 Mumbai, Maharashtra, India</p>
              <p>📧 support@gramkart.com</p>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4 font-serif text-xl">Platform</h4>
            <ul className="space-y-2 text-background/70">
              <li><Link href="/" className="hover:text-primary transition-colors">Discover</Link></li>
              <li><Link href="/creators" className="hover:text-primary transition-colors">Creators</Link></li>
              <li><Link href="/reels" className="hover:text-primary transition-colors">Trending</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 font-serif text-xl">Company</h4>
            <ul className="space-y-2 text-background/70">
              <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/seller/dashboard" className="hover:text-primary transition-colors">Apply as Seller</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-background/20 text-center text-background/60 text-sm">
          <p>&copy; 2024 Gramkart. All rights reserved. Styling-focused fashion marketplace for India.</p>
        </div>
      </footer>
    </div>
  );
}
