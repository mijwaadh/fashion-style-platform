'use client';

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const hyderabadContent = {
  faqData: [
    {
      question: "Where can I find wedding guest outfit ideas for Hyderabad weddings?",
      answer: "Browse our Wedding Guest category for looks perfect for Hyderabad's wedding season. From traditional Telangana-inspired wear to contemporary styles, find complete outfit inspiration with exact product details for Hyderabad celebrations."
    },
    {
      question: "What are the trending fashion styles in Hyderabad?",
      answer: "Hyderabad's fashion evolves at a unique pace blending traditional and contemporary influences. Explore our Trending section for real-time Hyderabad fashion inspiration from creators who understand the city's distinctive style culture."
    },
    {
      question: "Can I find professional office wear for Hyderabad workplaces?",
      answer: "Yes! Our Office Wear category features looks perfect for Hyderabad's corporate and IT sector workplaces. Find styling inspiration for professional environments from business formal to smart casual."
    },
    {
      question: "Are there fashion creators from Hyderabad on Gramkart?",
      answer: "Absolutely! Many talented fashion creators based in Hyderabad showcase their expertise on Gramkart. Follow them to get personalized styling advice and fashion inspiration from the city's growing creator community."
    },
    {
      question: "Where can I find traditional wear and ethnic fashion in Hyderabad?",
      answer: "Hyderabad celebrates its rich cultural heritage. Our Festival and special occasions categories feature beautiful traditional and ethnic wear curated by local creators who understand Hyderabad's cultural fashion."
    },
    {
      question: "What's popular for casual and weekend fashion in Hyderabad?",
      answer: "Hyderabad's relaxed lifestyle culture shows in its casual fashion. Browse our Casual and Date Night collections for weekend wear inspiration perfect for Hyderabad's social scene."
    }
  ]
};

export default function HyderabadPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const hyderabadSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": hyderabadContent.faqData.map(faq => ({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hyderabadSchema) }}
      />

      <main className="flex-1">
        <section className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/20 z-10" />
          <Image
            src="https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&q=80"
            alt="Hyderabad fashion styling and curated outfit looks for women"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="relative z-20 text-center px-4 max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white drop-shadow-lg">
              Curated Fashion Styling for Hyderabad
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium drop-shadow-md">
              Find complete outfit looks for Hyderabad fashion, weddings, office wear, and celebrations. Shop from top fashion creators.
            </p>
            <Button variant="creamy" size="lg" className="rounded-full" asChild>
              <Link href="/">Explore Looks</Link>
            </Button>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8">Fashion Styling for Hyderabad</h2>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                Hyderabad is India's rapidly growing tech and cultural hub, where traditional Telangana heritage meets modern contemporary fashion. The city's unique cultural identity and cosmopolitan growth create a distinctive fashion landscape.
              </p>
              <p>
                Gramkart celebrates Hyderabad's diverse fashion culture with curated looks from talented local creators who understand the city's lifestyle and preferences. Whether you're looking for traditional wear for cultural events, office wear for IT companies, or contemporary fashion, Hyderabad creators bring authentic local perspective.
              </p>
              <p>
                From traditional ethnic wear to modern contemporary styles, discover complete curated looks that reflect Hyderabad's cultural and cosmopolitan essence.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-12 md:py-16 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">Shop by Occasion in Hyderabad</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['Wedding Guest', 'Office Wear', 'Traditional Wear', 'Date Night', 'Casual Weekend', 'Festival Fashion'].map(cat => (
                <div key={cat} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold mb-3">{cat}</h3>
                  <p className="text-gray-700 mb-4">Browse curated {cat.toLowerCase()} looks for Hyderabad women.</p>
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">Hyderabad Fashion FAQs</h2>
            <div className="space-y-4">
              {hyderabadContent.faqData.map((faq, index) => (
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Discover Hyderabad Fashion on Gramkart</h2>
            <p className="text-xl text-gray-700 mb-8">
              Join thousands of Hyderabad women finding curated outfit inspiration from talented local creators.
            </p>
            <Button size="lg" className="rounded-full" asChild>
              <Link href="/">Start Exploring</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-background py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-2 md:col-span-2">
            <h3 className="font-serif text-2xl font-bold">Gramkart</h3>
            <p className="text-background/70 text-sm">India's styling-focused fashion marketplace serving major cities and communities.</p>
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
