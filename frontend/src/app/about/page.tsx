'use client';

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/20 z-10" />
          <Image
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80"
            alt="About Gramkart - Creator powered fashion platform"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="relative z-20 text-center px-4 max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-white drop-shadow-lg">
              About Gramkart
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-medium drop-shadow-md">
              Connecting creators with fashion-conscious shoppers through authentic video content
            </p>
          </div>
        </section>

        {/* What is Gramkart Section */}
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

        {/* Mission & Vision Section */}
        <section className="bg-gray-50 py-12 md:py-16 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Our Mission</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Empower fashion creators to monetize their expertise and build audiences while helping conscious consumers discover authentic, personalized styling through video content they can trust.
                </p>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Our Vision</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Create a fashion ecosystem where creator-driven content becomes the primary way people discover, learn about, and shop for fashion. Where authentic video styling replaces traditional product pages.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why We Exist Section */}
        <section className="bg-white py-12 md:py-16 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-center">Why Gramkart Exists</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-primary">For Creators</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">→</span>
                    <span>No barrier to entry. Anyone with style can build an audience and earn.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">→</span>
                    <span>Monetize your content directly. Every reel can generate income.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">→</span>
                    <span>Build a loyal following. Direct connection with your audience.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">→</span>
                    <span>Own your expertise. Showcase your unique style, not trends.</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-primary">For Shoppers</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">→</span>
                    <span>Trust real people over algorithms. See products on real creators.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">→</span>
                    <span>Find your style quickly. Follow creators whose aesthetic matches yours.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">→</span>
                    <span>Shop faster. One-click from video to cart. No endless browsing.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-primary font-bold">→</span>
                    <span>Support creators you love. Your purchases directly benefit them.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="bg-gray-50 py-12 md:py-16 border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-4 text-primary">Authenticity</h3>
                <p className="text-gray-700">
                  We celebrate real creators, real styling, and honest reviews. No fake reviews, no heavily edited photos. Video doesn't lie.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-4 text-primary">Creator Empowerment</h3>
                <p className="text-gray-700">
                  Creators are at the heart of Gramkart. We provide the platform, tools, and community for them to build audiences and earn fairly.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-4 text-primary">Transparency</h3>
                <p className="text-gray-700">
                  No hidden fees, no surprise costs. Clear pricing, clear commission structures, clear relationships between creators and shoppers.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-4 text-primary">Inclusivity</h3>
                <p className="text-gray-700">
                  Fashion is for everyone. All body types, styles, budgets, and occasions. Celebration of diversity in Indian fashion.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-4 text-primary">Quality Over Quantity</h3>
                <p className="text-gray-700">
                  We prioritize engaging, high-quality styling content. Not every product needs to be sold, but every reel should inspire.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-4 text-primary">Community First</h3>
                <p className="text-gray-700">
                  This is a community of creators and shoppers. We listen, we iterate, we build together based on real user feedback.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12 md:py-16 border-t border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Join the Creator Revolution</h2>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              Whether you're a creator ready to monetize your style or a shopper looking for authentic fashion inspiration, Gramkart is where creativity meets commerce.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="rounded-full" asChild>
                <Link href="/seller/dashboard">Become a Creator</Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full" asChild>
                <Link href="/reels">Watch Reels</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4 md:col-span-2">
            <h3 className="font-serif text-3xl font-bold">Gramkart</h3>
            <p className="text-background/70 max-w-sm">
              Creator-powered fashion platform. Watch influencers style real products in reels. Shop complete outfits or individual pieces.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Platform</h4>
            <ul className="space-y-2 text-background/70">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/reels" className="hover:text-primary transition-colors">Reels</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Creators</h4>
            <ul className="space-y-2 text-background/70">
              <li><Link href="/seller/dashboard" className="hover:text-primary transition-colors">Creator Dashboard</Link></li>
              <li><Link href="/seller/dashboard" className="hover:text-primary transition-colors">Apply as Creator</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Creator Resources</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-background/20 text-center text-background/60 text-sm">
          <p>&copy; 2024 Gramkart. Creator-powered fashion marketplace for India. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
