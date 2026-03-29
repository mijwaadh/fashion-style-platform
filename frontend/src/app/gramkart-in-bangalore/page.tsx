'use client';

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const bangaloreContent = {
  faqData: [
    {
      question: "Where can I find wedding guest outfits for Bangalore weddings?",
      answer: "Browse our Wedding Guest category for looks perfect for Bangalore weddings and celebrations. From traditional Indian weddings to contemporary wedding events, find complete outfit inspiration with exact product details and pricing."
    },
    {
      question: "What fashion trends are popular in Bangalore right now?",
      answer: "Bangalore's young, cosmopolitan population embraces diverse fashion trends. Explore our Trending section for real-time Bangalore fashion inspiration from our creator community reflecting the city's contemporary style."
    },
    {
      question: "Can I find office wear for Bangalore's tech and corporate scene?",
      answer: "Absolutely! Our Office Wear category features professional looks perfect for Bangalore's corporate environment. From tech company casual to corporate formal, find styling inspiration for Bangalore workplaces."
    },
    {
      question: "Do fashion creators from Bangalore use Gramkart?",
      answer: "Yes! Many talented fashion creators and stylists based in Bangalore curate looks on Gramkart. Follow them for personalized styling advice and fashion inspiration reflecting Bangalore's contemporary style culture."
    },
    {
      question: "Where can I find sustainable fashion brands based in Bangalore?",
      answer: "Bangalore has a thriving sustainable fashion community. Browse our sellers to discover eco-conscious and ethical fashion brands curated into complete sustainable style looks."
    },
    {
      question: "What's popular for weekend wear and casual styling in Bangalore?",
      answer: "Bangalore's casual fashion culture is unique. Our Casual and Date Night categories feature looks perfect for Bangalore's cosmopolitan weekend scene, from casual brunches to weekend outings."
    }
  ]
};

export default function BangalorePage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const bangaloreSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": bangaloreContent.faqData.map(faq => ({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bangaloreSchema) }}
      />

      <main className="flex-1">
        <section className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/20 z-10" />
          <Image
            src="https://images.unsplash.com/photo-1539231385867-8f55beab200f?auto=format&fit=crop&q=80"
            alt="Bangalore fashion styling and curated outfit looks for women"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="relative z-20 text-center px-4 max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white drop-shadow-lg">
              Curated Fashion Styling for Bangalore
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium drop-shadow-md">
              Find complete outfit looks for Bangalore fashion, weddings, office wear, and weekends. Shop from top fashion creators.
            </p>
            <Button variant="creamy" size="lg" className="rounded-full" asChild>
              <Link href="/">Explore Looks</Link>
            </Button>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8">Fashion Styling for Bangalore</h2>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                Bangalore is India's cosmopolitan tech hub where contemporary fashion thrives. The city's young demographic and progressive culture make it a leader in modern fashion trends, sustainable style, and creative individual expression.
              </p>
              <p>
                Gramkart showcases Bangalore's vibrant fashion scene with curated looks from talented local creators who understand the city's contemporary aesthetic. Whether you're dressing for a startup workplace, weekend socializing, or traditional events, Bangalore creators bring fresh styling perspectives.
              </p>
              <p>
                From sustainable fashion to contemporary styling, discover complete curated looks that capture Bangalore's modern, inclusive fashion culture.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-12 md:py-16 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">Shop by Occasion in Bangalore</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {['Wedding Guest', 'Office Wear', 'Weekend Casual', 'Date Night', 'Party Wear', 'Sustainable Fashion'].map(cat => (
                <div key={cat} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-bold mb-3">{cat}</h3>
                  <p className="text-gray-700 mb-4">Browse curated {cat.toLowerCase()} looks for Bangalore women.</p>
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">Bangalore Fashion FAQs</h2>
            <div className="space-y-4">
              {bangaloreContent.faqData.map((faq, index) => (
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Discover Bangalore Fashion on Gramkart</h2>
            <p className="text-xl text-gray-700 mb-8">
              Join thousands of Bangalore women finding curated outfit inspiration from talented local creators.
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
            <p className="text-background/70 text-sm">India's styling-focused fashion marketplace with presence in all major Indian cities.</p>
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
