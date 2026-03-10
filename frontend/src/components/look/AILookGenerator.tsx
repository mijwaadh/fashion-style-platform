'use client';

import { useState } from 'react';
import { X, Sparkles, Loader2, Wand2, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AILookGeneratorProps {
    onSuccess: (look: any) => void;
    onClose: () => void;
}

export default function AILookGenerator({ onSuccess, onClose }: AILookGeneratorProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [preferences, setPreferences] = useState({
        gender: 'unisex',
        occasion: 'casual',
        budgetRange: 'mid-range',
        style: 'streetwear'
    });

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            const look = await api.post('/api/looks/generate-ai', preferences);
            toast.success('AI has styled a new look for you!');
            onSuccess(look);
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'AI was unable to style a look right now.');
        } finally {
            setIsLoading(false);
        }
    };

    const occasions = ['casual', 'formal', 'party', 'wedding', 'workout', 'office'];
    const budgets = ['budget', 'mid-range', 'luxury'];
    const styles = ['streetwear', 'minimalist', 'bohemian', 'classic', 'vintage'];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-md bg-background border border-border rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary rounded-2xl text-primary-foreground shadow-lg shadow-primary/20">
                                <Wand2 className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-serif font-bold">AI Stylest</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <p className="text-sm text-muted-foreground font-medium mb-8">
                        Tell us your vibe and budget, and our AI will curate a complete head-to-toe outfit for you.
                    </p>

                    <div className="space-y-8">
                        {/* Occasion */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Occasion</p>
                            <div className="flex flex-wrap gap-2">
                                {occasions.map(o => (
                                    <button
                                        key={o}
                                        onClick={() => setPreferences({ ...preferences, occasion: o })}
                                        className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all border ${preferences.occasion === o
                                                ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                                : 'bg-muted text-muted-foreground border-transparent hover:border-primary/20'
                                            }`}
                                    >
                                        {o}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Budget</p>
                            <div className="grid grid-cols-3 gap-2">
                                {budgets.map(b => (
                                    <button
                                        key={b}
                                        onClick={() => setPreferences({ ...preferences, budgetRange: b })}
                                        className={`py-2.5 rounded-2xl text-xs font-bold capitalize transition-all border ${preferences.budgetRange === b
                                                ? 'bg-primary/10 text-primary border-primary/50'
                                                : 'bg-muted text-muted-foreground border-transparent'
                                            }`}
                                    >
                                        {b}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Style Type */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-foreground uppercase tracking-widest">Style Vibe</p>
                            <div className="flex flex-wrap gap-2">
                                {styles.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setPreferences({ ...preferences, style: s })}
                                        className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all border ${preferences.style === s
                                                ? 'bg-foreground text-background border-foreground'
                                                : 'bg-muted text-muted-foreground border-transparent'
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-muted/50 border-t border-border mt-4">
                    <Button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full h-14 rounded-full font-black text-base shadow-xl shadow-primary/20 bg-primary group"
                    >
                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <span className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                                Generate My Look
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
