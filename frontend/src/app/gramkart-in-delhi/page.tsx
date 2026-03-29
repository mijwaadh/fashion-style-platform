'use client';

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const delhiContent = {
  faqData: [
    {
      question: "Which Delhi creators are styling on Gramkart?",
      answer: "Dozens of talented fashion creators and influencers based in Delhi are styling products in engaging reels daily. From fashion influencers to professional stylists, follow your favorites and get consistent inspiration tailored to your style."
    },
    {
      question: "How do I find wedding guest outfit reels for Delhi events?",
      answer: "Browse our Wedding Guest section to watch creators styling complete wedding looks in short videos. See how outfits move, fit, and pair with accessories. Then shop the exact pieces or create your own mix from the creator's video."
    },
    {
      question: "Can I watch office wear styling for Delhi corporate culture?",
      answer: "Yes! Watch Delhi creators styling professional looks for corporate environments. See styling tips for business casual, formal, and startup casual office wear. One-click shopping for the exact outfits from the videos."
    },
    {
      question: "How do creators from Delhi film their styling reels?",
      answer: "Our top Delhi creators film authentic, entertaining reels showing real-time styling. They showcase how products look on different body types, seasons, and occasions. Watch the process and shop directly from their recommendations."
    },
    {
      question: "Can I shop trending Delhi festival fashion from reels?",
      answer: "Absolutely! Watch Delhi creators style looks for Diwali, Holi, Durga Puja, Eid, and other festivals throughout the year. Each reel shows complete styling with exact prices. Buy the full look or individual pieces."
    },
    {
      question: "How do I follow my favorite Delhi fashion creators?",
      answer: "Visit creator profiles on Gramkart and hit follow. You'll see their new styling reels in your personalized feed. Get notified when they post new content and shop directly from their videos."
    }
  ]
};

export default function DelhiPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const delhiSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": delhiContent.faqData.map(faq => ({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(delhiSchema) }}
      />

      <main className="flex-1">
        <section className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/20 z-10" />
          <Image
            src="https://images.unsplash.com/photo-1490488277066-81342ee5ff30?auto=format&fit=crop&q=80"
            alt="Delhi fashion styling and curated outfit looks for women"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="relative z-20 text-center px-4 max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white drop-shadow-lg">
              Delhi's Creator-Styled Fashion
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium drop-shadow-md">
              Watch fashion creators in Delhi style real products in engaging reels. Shop complete outfits or individual pieces directly from videos for weddings, office wear, festivals, and everyday looks.
            </p>
            <Button variant="creamy" size="lg" className="rounded-full" asChild>
              <Link href="/">Explore Looks</Link>
            </Button>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8">Delhi Creator Fashion on Gramkart</h2>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                Delhi's fashion scene is vibrant, cosmopolitan, and constantly evolving. From traditional Indian wear to contemporary global fashion, Delhi creators understand it all. On Gramkart, you'll find talented fashion influencers, stylists, and designers from Delhi creating engaging styling reels every day.
              </p>
              <p>
                Watch real creators in real Delhi settings—from Connaught Place to corporate offices to wedding venues—styling actual products and showing you how to recreate the looks. See the styling process, get honest reviews, and shop the exact pieces one click away from the video.
              </p>
              <p>
                Follow your favorite Delhi creators to get consistent, personalized styling inspiration. Whether it's fusion wear for weddings, business casual for Delhi offices, or contemporary fashion that matches Delhi's cosmopolitan culture, you'll find authentic styling from people who live the lifestyle.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-12 md:py-16 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">Shop by Occasion in Delhi</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['Wedding Guest', 'Office Wear', 'Festival', 'Date Night', 'Party Wear', 'Casual Chic'].map(cat => (
                <div key={cat} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold mb-3">{cat}</h3>
                  <p className="text-gray-700 mb-4">Browse curated {cat.toLowerCase()} looks perfect for Delhi women.</p>
                  <Link href="/" className="text-primary font-semibold hover:underline">
                    View Looks →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">Delhi Fashion FAQs</h2>
            <div className="space-y-4">
              {delhiContent.faqData.map((faq, index) => (
                <div key={index} className="border border-border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                  <button
                    className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  >
                    <h3 className="text-lg font-semibold text-left">{faq.question}</h3>
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

        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12 md:py-16 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Discover Delhi Creators on Gramkart</h2>
            <p className="text-xl text-gray-700 mb-8">
              Watch fashion creators from Delhi styling real products in engaging reels. Shop complete looks or individual pieces instantly. Follow your favorite creators for daily styling inspiration.
            </p>
            <Button size="lg" className="rounded-full" asChild>
              <Link href="/">Start Watching Reels</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-background py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-2 md:col-span-2">
            <h3 className="font-serif text-2xl font-bold">Gramkart</h3>
            <p className="text-background/70 text-sm">Creator-powered fashion platform. Watch Delhi influencers style real products in reels. Shop complete looks or individual pieces.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Cities</h4>
            <ul className="space-y-2 text-background/70 text-sm">
              <li><Link href="/gramkart-in-mumbai" className="hover:text-primary">Mumbai</Link></li>
              <li><Link href="/gramkart-in-delhi" className="hover:text-primary">Delhi</Link></li>
              <li><Link href="/gramkart-in-bangalore" className="hover:text-primary">Bangalore</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-background/70 text-sm">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              <li><Link href="/" className="hover:text-primary">About</Link></li>
              <li><Link href="/" className="hover:text-primary">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-background/20 text-center text-background/60 text-sm">
          <p>&copy; 2024 Gramkart. Fashion styling marketplace for India. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
