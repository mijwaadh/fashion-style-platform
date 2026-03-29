'use client';

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const mumbaiContent = {
  title: "Shop Curated Fashion Styling for Mumbai | Gramkart",
  description: "Discover curated outfit looks for Mumbai fashion. Wedding guest dresses, office wear, festival fashion & styling ideas for Mumbai women. Shop from top creators.",
  faqData: [
    {
      question: "Where can I find wedding guest outfit ideas in Mumbai?",
      answer: "Browse our Wedding Guest category for curated looks perfect for Mumbai weddings. We feature styling ideas for Indian weddings, cocktail events, and celebrations. Each look shows exact pieces and prices for Mumbai-based shopping."
    },
    {
      question: "What are popular fashion trends in Mumbai right now?",
      answer: "Mumbai fashion trends blend modern styles with traditional elements. Explore our Trending section for real-time Mumbai fashion inspiration from our creator community. From western wear to fusion styles, discover what's popular in Mumbai today."
    },
    {
      question: "Can I shop office wear outfits suitable for Mumbai offices?",
      answer: "Yes! Our Office Wear category features looks perfect for corporate environments in Mumbai. From business casual to formal office wear, find styling inspiration that works for professional settings in India's financial capital."
    },
    {
      question: "Do creators in Mumbai curate looks?",
      answer: "Absolutely! Gramkart features many talented fashion creators based in Mumbai who understand local trends, climates, and preferences. Follow Mumbai-based creators to get personalized styling advice and local fashion inspiration."
    },
    {
      question: "How do I find sustainable or eco-friendly fashion in Mumbai?",
      answer: "Filter by sellers and creators who focus on sustainable fashion. Many Mumbai-based independent designers and ethical brands use Gramkart to showcase their curated collections."
    },
    {
      question: "What's the best time to shop for festival wear in Mumbai?",
      answer: "Explore our Festival category year-round. Mumbai's diverse festival calendar means you'll find looks for Diwali, Holi, Eid, Christmas, and more. Browse anytime and save looks for upcoming celebrations."
    }
  ]
};

export default function MumbaiPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const mumbaiSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": mumbaiContent.faqData.map(faq => ({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mumbaiSchema) }}
      />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/20 z-10" />
          <Image
            src="https://images.unsplash.com/photo-1485956109705-3795b5e9b0db?auto=format&fit=crop&q=80"
            alt="Mumbai fashion styling and curated outfit looks for women"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="relative z-20 text-center px-4 max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white drop-shadow-lg">
              Curated Fashion Styling for Mumbai
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium drop-shadow-md">
              Find complete outfit looks for Mumbai fashion, weddings, office wear, and celebrations. Shop from top fashion creators in India.
            </p>
            <Button variant="creamy" size="lg" className="rounded-full" asChild>
              <Link href="/">Explore Looks</Link>
            </Button>
          </div>
        </section>

        {/* About Mumbai Fashion */}
        <section className="bg-white py-12 md:py-16 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8">Styling Fashion for Mumbai</h2>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                Mumbai is India's fashion capital, where cosmopolitan style meets diverse cultural influences. From traditional Indian wedding wear to contemporary western fashion, Mumbai's fashion landscape is vibrant and ever-evolving.
              </p>
              <p>
                Gramkart celebrates Mumbai's fashion diversity with curated looks from local creators who understand the city's unique style preferences. Whether you're dressing for a corporate environment in Bandra, a wedding celebration, or casual weekend plans, our Mumbai creators have curated looks that work perfectly.
              </p>
              <p>
                Our community features fashion experts based in Mumbai who curate complete outfit looks reflecting current Mumbai fashion trends. From traditional wear to fusion styles, find inspiration for every occasion.
              </p>
            </div>
          </div>
        </section>

        {/* Categories for Mumbai */}
        <section className="bg-gray-50 py-12 md:py-16 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">Shop by Occasion in Mumbai</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['Wedding Guest', 'Office Wear', 'Festival', 'Date Night', 'Casual Weekend', 'Formal Events'].map(cat => (
                <div key={cat} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold mb-3">{cat}</h3>
                  <p className="text-gray-700 mb-4">Browse curated {cat.toLowerCase()} looks perfect for Mumbai women.</p>
                  <Link href="/" className="text-primary font-semibold hover:underline">
                    View Looks →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-white py-12 md:py-16 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">Mumbai Fashion FAQs</h2>
            <div className="space-y-4">
              {mumbaiContent.faqData.map((faq, index) => (
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

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12 md:py-16 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Discover Mumbai Fashion on Gramkart</h2>
            <p className="text-xl text-gray-700 mb-8">
              Join thousands of Mumbai women finding curated outfit inspiration. Shop from talented creators and build your stylish wardrobe.
            </p>
            <Button size="lg" className="rounded-full" asChild>
              <Link href="/">Start Exploring</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-2 md:col-span-2">
            <h3 className="font-serif text-2xl font-bold">Gramkart</h3>
            <p className="text-background/70 text-sm">
              India's styling-focused fashion marketplace. Curated looks in Mumbai, Delhi, Bangalore, and more.
            </p>
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
          <p>&copy; 2024 Gramkart. Curated fashion styling for India. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
