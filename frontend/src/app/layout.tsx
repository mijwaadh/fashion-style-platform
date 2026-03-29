import type { Metadata } from 'next';
import { Playfair_Display, Lato } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/CartDrawer';
import { Toaster } from 'sonner';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Gramkart | Creator-Styled Fashion. Shop Real Looks.',
  description: 'Watch fashion creators style real products in engaging reels. Shop complete outfits or individual pieces directly from videos. India\'s creator-powered fashion platform.',
  metadataBase: new URL('https://gramkart.vercel.app'),
  keywords: 'creator fashion, UGC fashion, fashion reels, outfit styling, Indian fashion creators, social commerce, TikTok fashion',
  authors: [{ name: 'Gramkart' }],
  openGraph: {
    title: 'Gramkart | Creator-Styled Fashion. Shop Real Looks.',
    description: 'Watch fashion creators style real products in reels. Shop the complete outfit or individual pieces directly from the video.',
    url: 'https://gramkart.vercel.app',
    siteName: 'Gramkart',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'Creator-styled fashion outfits for shopping',
      },
    ],
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gramkart | Creator-Styled Fashion. Shop Real Looks.',
    description: 'Watch creators style products in reels. Shop complete outfits or individual pieces.',
    images: ['https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80'],
  },
  robots: 'index, follow',
  alternates: {
    canonical: 'https://gramkart.vercel.app',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://gramkart.vercel.app",
    "name": "Gramkart",
    "url": "https://gramkart.vercel.app",
    "logo": "https://gramkart.vercel.app/logo.png",
    "description": "Creator-powered fashion platform where influencers style products in reels. Shop complete outfits or individual pieces directly from videos.",
    "sameAs": [
      "https://www.instagram.com/gramkart",
      "https://www.facebook.com/gramkart"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "support@gramkart.com"
    }
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Gramkart",
    "image": "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80",
    "description": "Creator-powered fashion platform with curated styling reels and direct shopping",
    "url": "https://gramkart.vercel.app",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Mumbai",
      "addressRegion": "MH",
      "addressCountry": "IN"
    },
    "areaServed": {
      "@type": "State",
      "name": "India"
    }
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      <body className={`${lato.variable} ${playfair.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
            <Toaster position="top-center" richColors />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

