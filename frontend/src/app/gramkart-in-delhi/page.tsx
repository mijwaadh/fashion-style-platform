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
      question: "Where can I find wedding guest outfit ideas in Delhi?",
      answer: "Browse our Wedding Guest category for curated looks perfect for Delhi weddings. We feature styling ideas for Delhi's diverse wedding celebrations from traditional to modern. Each look shows exact pieces and prices."
    },
    {
      question: "What are the trending fashion styles in Delhi?",
      answer: "Delhi fashion blends traditional Indian wear with contemporary styles. Explore our Trending section for real-time Delhi fashion inspiration from creators who understand the city's dynamic style culture."
    },
    {
      question: "Can I find office wear for Delhi corporate settings?",
      answer: "Yes! Our Office Wear category features professional looks perfect for Delhi offices. From business formal to smart casual, find styling inspiration for corporate environments in Delhi."
    },
    {
      question: "Are there Delhi-based fashion creators on Gramkart?",
      answer: "Absolutely! Many talented fashion creators based in Delhi use Gramkart to showcase their expertise. Follow Delhi creators to get personalized styling advice and locally-inspired fashion looks."
    },
    {
      question: "Where can I find sustainable fashion brands in Delhi?",
      answer: "Many Delhi-based sustainable fashion brands and independent designers feature on Gramkart. Filter by sellers to discover eco-friendly and ethical fashion options curated into complete looks."
    },
    {
      question: "What festival looks are popular in Delhi?",
      answer: "Delhi celebrates multiple festivals year-round. Our Festival category features looks for Diwali, Holi, Durga Puja, and more. Browse anytime to find festival wear inspiration perfect for Delhi celebrations."
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
              Curated Fashion Styling for Delhi
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium drop-shadow-md">
              Find complete outfit looks for Delhi fashion, weddings, office wear, and celebrations. Shop from top fashion creators.
            </p>
            <Button variant="creamy" size="lg" className="rounded-full" asChild>
              <Link href="/">Explore Looks</Link>
            </Button>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8">Fashion Styling for Delhi</h2>
            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                Delhi is India's culturally rich capital where tradition meets contemporary fashion. The city's fashion scene reflects diverse influences and international exposure, making it a hub for innovative styling and traditional elegance.
              </p>
              <p>
                Gramkart celebrates Delhi's diverse fashion culture with curated looks from talented local creators. Whether you're shopping for traditional occasions, corporate settings, or contemporary fashion, Delhi creators understand the city's unique style needs.
              </p>
              <p>
                From modern Delhi women's fashion to traditional wear, find complete curated looks that reflect the city's dynamic and inclusive fashion scene.
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
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Discover Delhi Fashion on Gramkart</h2>
            <p className="text-xl text-gray-700 mb-8">
              Join thousands of Delhi women finding curated outfit inspiration from top fashion creators.
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
            <p className="text-background/70 text-sm">India's styling-focused fashion marketplace with locations in major Indian cities.</p>
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
