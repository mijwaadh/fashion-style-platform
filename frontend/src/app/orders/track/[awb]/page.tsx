'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Truck, Package, MapPin, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export default function TrackingPage() {
    const params = useParams();
    const awb = params.awb as string;
    
    return (
        <div className="min-h-screen bg-zinc-50">
            <Navbar />
            
            <main className="max-w-3xl mx-auto px-6 py-12">
                <Link href="/profile" className="inline-flex items-center gap-2 text-zinc-500 hover:text-primary transition-colors mb-8 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">Back to Orders</span>
                </Link>

                <div className="bg-white rounded-[2.5rem] border border-zinc-200 overflow-hidden shadow-sm">
                    {/* Header Section */}
                    <div className="p-8 md:p-12 border-b border-zinc-100 bg-zinc-50/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                                        <Truck className="w-4 h-4 text-white" />
                                    </div>
                                    <h1 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">Aura Logistics</h1>
                                </div>
                                <h2 className="text-3xl font-serif font-black text-zinc-900 leading-tight">Shipment Details</h2>
                                <p className="text-xs text-zinc-500 font-mono mt-1 uppercase">Tracking ID: {awb}</p>
                            </div>

                            <div className="bg-white px-6 py-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Status</span>
                                <span className="text-lg font-black text-primary uppercase tracking-tight font-serif italic">SHIPPED</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 md:p-12 text-center py-20 bg-white">
                        <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                            <div className="p-6 bg-primary/5 rounded-full text-primary border border-primary/10">
                                <Package className="w-12 h-12" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-serif font-bold text-zinc-900">Handed Over to Courier</h3>
                                <p className="text-zinc-500 mt-4 leading-relaxed">
                                    Your order has been shipped manually by the seller. Please use the tracking ID provided below to track your package on the official courier website.
                                </p>
                            </div>

                            <div className="w-full p-6 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Manual Tracking ID</p>
                                    <p className="text-xl font-mono font-black text-zinc-900 select-all">{awb}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Call to Action */}
                    <div className="p-8 md:p-12 bg-zinc-900 border-t border-zinc-800 text-white flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <p className="text-lg font-serif font-bold leading-tight italic text-zinc-100">Quality checks in progress.</p>
                            <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest font-black whitespace-nowrap">Independent Seller Fulfillment x Aura</p>
                        </div>
                        <Button variant="secondary" className="rounded-xl h-12 px-8 font-black uppercase text-xs tracking-widest whitespace-nowrap" asChild>
                            <Link href="/">Back To Style Hub</Link>
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
