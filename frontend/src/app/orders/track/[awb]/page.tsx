'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Loader2, Truck, Package, MapPin, CheckCircle2, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

interface TrackingCheckpoint {
    location: string;
    date: string;
    activity: string;
    status: string;
}

interface TrackingData {
    tracking_data: {
        track_status: number;
        shipment_status: string;
        shipment_track_activities: TrackingCheckpoint[];
        track_url: string;
    };
}

export default function TrackingPage() {
    const params = useParams();
    const awb = params.awb as string;
    
    const [tracking, setTracking] = useState<TrackingData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTracking = async () => {
            try {
                const data = await api.get<TrackingData>(`/api/orders/track/${awb}`);
                setTracking(data);
            } catch (err: any) {
                console.error("Tracking fetch failed", err);
                setError("Tracking information is currently unavailable. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        if (awb) fetchTracking();
    }, [awb]);

    const checkpoints = tracking?.tracking_data?.shipment_track_activities || [];
    const currentStatus = tracking?.tracking_data?.shipment_status || "In Transit";

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
                                <h2 className="text-3xl font-serif font-black text-zinc-900 leading-tight">Live Tracking</h2>
                                <p className="text-xs text-zinc-500 font-mono mt-1">AWB: {awb}</p>
                            </div>

                            <div className="bg-white px-6 py-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Status</span>
                                <span className="text-lg font-black text-primary uppercase tracking-tight">{currentStatus}</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 md:p-12">
                        {isLoading ? (
                            <div className="py-20 flex flex-col items-center gap-4">
                                <Loader2 className="w-10 h-10 animate-spin text-primary/30" />
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Bridging Carrier Data...</p>
                            </div>
                        ) : error ? (
                            <div className="py-20 flex flex-col items-center text-center gap-4">
                                <div className="p-4 bg-rose-50 rounded-full text-rose-500"><AlertCircle className="w-8 h-8" /></div>
                                <div className="max-w-xs">
                                    <p className="font-bold text-zinc-900 leading-tight">Sync Delayed</p>
                                    <p className="text-sm text-zinc-500 mt-2">{error}</p>
                                </div>
                            </div>
                        ) : checkpoints.length === 0 ? (
                            <div className="py-20 flex flex-col items-center text-center gap-6">
                                <div className="p-6 bg-zinc-50 rounded-full text-zinc-300 border border-zinc-100"><Package className="w-10 h-10 translate-y-1" /></div>
                                <div className="max-w-xs">
                                    <p className="text-lg font-black text-zinc-900">Shipment Created</p>
                                    <p className="text-sm text-zinc-500 mt-2">The seller has processed your shipment. Carrier checkpoints will appear here once the package is picked up.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-10">
                                {checkpoints.map((cp, idx) => (
                                    <div key={idx} className="relative pl-10 md:pl-12 group last:pb-0 pb-10">
                                        {/* Vertical Connector Line */}
                                        {idx !== checkpoints.length - 1 && (
                                            <div className="absolute left-[15px] md:left-[19px] top-8 bottom-[-20px] w-[2px] bg-zinc-100 group-hover:bg-primary/20 transition-colors" />
                                        )}
                                        
                                        {/* Activity Icon */}
                                        <div className={`absolute left-0 top-0 w-8 h-8 md:w-10 md:h-10 rounded-full border-4 border-white shadow-md flex items-center justify-center z-10 
                                            ${idx === 0 ? 'bg-primary text-white scale-110' : 'bg-zinc-100 text-zinc-400'}`}>
                                            {idx === 0 ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-zinc-300" />}
                                        </div>

                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 md:gap-10">
                                            <div className="flex-1">
                                                <h4 className={`text-base font-black leading-tight ${idx === 0 ? 'text-zinc-900' : 'text-zinc-500 font-bold'}`}>
                                                    {cp.activity}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-2 text-zinc-400">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">{cp.location || "In Transit"}</span>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-0">
                                                <p className="text-xs font-black text-zinc-900">{new Date(cp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{new Date(cp.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Call to Action */}
                    <div className="p-8 md:p-12 bg-zinc-900 border-t border-zinc-800 text-white flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <p className="text-lg font-serif font-bold leading-tight italic">Quality checks in progress.</p>
                            <p className="text-xs text-zinc-400 mt-1 uppercase tracking-widest font-black">Powered by Shiprocket x Aura</p>
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
