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
    answer: "Gramkart is an India-focused styling marketplace where fashion creators curate complete outfit looks for every occasion. From wedding guest dresses to office wear, festival fashion, and everyday styling inspiration, we help you discover complete styled looks you can shop with just one click."
  },
  {
    question: "How do I find curated outfit styling for weddings in India?",
    answer: "Visit our Wedding Guest category to browse curated outfit collections for Indian weddings. Each look shows the complete styling, pricing, and you can shop all pieces together. Perfect for finding outfit ideas for wedding season in India."
  },
  {
    question: "Can I sell and create looks on Gramkart?",
    answer: "Yes! Gramkart welcomes fashion creators and sellers. You can create curated looks, build a following, and earn through commissions. Visit 'Apply as Seller' to join our creator community."
  },
  {
    question: "What makes Gramkart different from other fashion marketplaces?",
    answer: "Gramkart offers complete curated outfit looks, not just individual products. Our unique approach combines fashion discovery with social commerce, letting creators showcase expertise while shoppers get complete styling solutions with pricing transparency."
  },
  {
    question: "How do I use Gramkart's AI styling assistant?",
    answer: "Click 'Style with AI' on our homepage to describe your style preferences, occasion, or body type. Our AI generates personalized outfit looks in seconds. You can then refine, save, or shop the entire look."
  },
  {
    question: "Is there free shipping on styled outfit purchases?",
    answer: "Shipping policies vary by seller and order value. Check individual product pages and seller details for shipping information. Many sellers offer free shipping on orders above certain amounts."
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
              Shop Curated Fashion Styling & Outfit Looks in India
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium drop-shadow-md pb-4">
              Discover complete styled outfits for weddings, office wear, festivals, and everyday fashion. Shop curated looks from top fashion creators in India.
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
                Gramkart is India's premier styling-focused fashion marketplace where talented creators curate complete outfit looks for every occasion, lifestyle, and budget. Unlike traditional fashion retail, we believe that styling is an art form, and our platform celebrates the expertise of fashion creators who understand trends, proportions, and personal style.
              </p>
              <p>
                Whether you're searching for wedding guest outfit ideas, office wear styling, festival fashion, or everyday casual looks, Gramkart offers curated collections that solve a fundamental fashion problem: "What should I wear?" Instead of spending hours browsing individual products, our community of creators has already done the work, styling complete, shoppable looks with exact product links and pricing.
              </p>
              <p>
                Our mission is to make fashion accessible, affordable, and exciting for everyone in India. We connect independent fashion creators, style enthusiasts, and sellers with conscious consumers who value thoughtful styling over fast fashion trends.
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
                <h3 className="text-xl font-bold mb-4">Discover Curated Looks</h3>
                <p className="text-gray-700">Browse complete outfit looks curated by fashion creators. See styling ideas for weddings, office wear, festivals, casual dates, vacations, streetwear, and more.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-4xl font-bold text-primary mb-4">2</div>
                <h3 className="text-xl font-bold mb-4">Get Instant Details</h3>
                <p className="text-gray-700">Every look shows exact product names, prices, links, and seller information. See the complete breakdown and all styling pieces at a glance.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-4xl font-bold text-primary mb-4">3</div>
                <h3 className="text-xl font-bold mb-4">Shop & Save Looks</h3>
                <p className="text-gray-700">Shop individual pieces or entire looks direct from sellers. Save inspirational looks to collections for later, and follow creators for consistent style updates.</p>
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
                <span><strong>Complete Curated Looks:</strong> Get full outfit styling, not scattered product recommendations. Every piece works together for a cohesive look.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-2xl text-primary font-bold min-w-fit">✓</span>
                <span><strong>Indian Fashion Creators:</strong> Support independent Indian fashion experts, stylists, and designers who understand Indian body types, occasions, and budgets.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-2xl text-primary font-bold min-w-fit">✓</span>
                <span><strong>Transparent Pricing:</strong> See exact prices upfront. No hidden costs. Shop directly from verified sellers.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-2xl text-primary font-bold min-w-fit">✓</span>
                <span><strong>AI-Powered Styling:</strong> Use our AI Styling Assistant to generate personalized looks based on your preferences, body type, and occasion.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-2xl text-primary font-bold min-w-fit">✓</span>
                <span><strong>Save & Organize:</strong> Create custom collections, save favorite looks, track orders, and follow creators for consistent style inspiration.</span>
              </li>
              <li className="flex gap-4">
                <span className="text-2xl text-primary font-bold min-w-fit">✓</span>
                <span><strong>Community Driven:</strong> Join a community of style-conscious shoppers, get feedback on your looks, and participate in trending styles.</span>
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Become a Fashion Creator on Gramkart</h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Are you a fashion stylist, designer, or seller? Join our creator community. Curate looks, build your audience, and earn commissions. Let your styling expertise shine on India's premier styling marketplace.
            </p>
            <Button size="lg" className="rounded-full" asChild>
              <Link href="/seller/dashboard">Apply as Seller/Creator</Link>
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
              India's premier styling-focused fashion marketplace. Shop complete curated outfit looks with transparent pricing from our community of fashion creators.
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
