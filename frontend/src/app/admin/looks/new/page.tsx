'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, AlertCircle, Loader2, Plus, X, CheckCircle2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import AdminGuard from '@/components/layout/AdminGuard';

interface Product {
    _id: string;
    name: string;
    brand: string;
    price: number;
    imageUrl: string;
    sellerId: {
        _id: string;
        storeName?: string;
        name: string;
    };
}

export default function AdminNewLookPage() {
    return (
        <AdminGuard>
            <NewLookContent />
        </AdminGuard>
    );
}

function NewLookContent() {
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [occasion, setOccasion] = useState<string[]>([]);
    const [budgetRange, setBudgetRange] = useState('mid-range');
    const [gender, setGender] = useState('women');

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Products Search & Selection
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Search for products
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.trim().length < 2) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const data = await api.get<any>(`/api/search?q=${encodeURIComponent(searchQuery)}`);
                setSearchResults(data.products || []);
            } catch (err) {
                console.error("Search failed:", err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const toggleOccasion = (occ: string) => {
        setOccasion(prev =>
            prev.includes(occ) ? prev.filter(o => o !== occ) :
                prev.length < 3 ? [...prev, occ] : prev
        );
    };

    const toggleProduct = (product: Product) => {
        setSelectedProducts(prev => {
            const isSelected = prev.some(p => p._id === product._id);
            if (isSelected) {
                return prev.filter(p => p._id !== product._id);
            } else {
                return [...prev, product];
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!title || occasion.length === 0 || !imageFile) {
            setError('Please add a title, select at least one occasion, and upload an image.');
            return;
        }

        if (selectedProducts.length === 0) {
            setError('Please tag at least one product in this look.');
            return;
        }

        setLoading(true);

        try {
            // Calculate total budget
            const totalEstimatedBudget = selectedProducts.reduce((sum, p) => sum + p.price, 0);

            // 1. Upload Look Image
            const formData = new FormData();
            formData.append('image', imageFile);

            const token = JSON.parse(sessionStorage.getItem('aura_user') || '{}')?.token;
            const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            const uploadData = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(uploadData.message || 'Image upload failed.');
            const imageUrl = uploadData.url;

            // 2. Create the Look record
            const payload = {
                title,
                description,
                occasion,
                budgetRange,
                gender,
                totalEstimatedBudget,
                imageUrl,
                productsIncluded: selectedProducts.map(p => p._id)
            };

            await api.post('/api/looks', payload);
            router.push('/admin/looks');
        } catch (err: any) {
            setError(err.message || 'Failed to publish look.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/30 pb-20">
            <header className="bg-background border-b border-border sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/looks" className="text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="font-serif text-xl font-bold text-foreground">Admin: Create Global Look</h1>
                    </div>
                    <Button onClick={handleSubmit} variant="default" className="rounded-full px-6" disabled={loading}>
                        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</> : 'Publish Look'}
                    </Button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 mt-8">
                {error && (
                    <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Image Upload */}
                    <div className="space-y-4">
                        <div className="bg-background rounded-2xl p-6 border border-border shadow-sm h-full flex flex-col">
                            <h2 className="font-semibold text-foreground mb-4">Main Look Image *</h2>

                            <div className="relative flex-1 min-h-[500px] w-full mx-auto rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors bg-muted overflow-hidden group cursor-pointer">
                                {imagePreview ? (
                                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                                        <UploadCloud className="w-12 h-12 mb-4 text-border group-hover:text-primary transition-colors" />
                                        <p className="text-base font-medium text-foreground">Upload full outfit photo</p>
                                        <p className="text-sm mt-2 opacity-80 max-w-xs">Use a high-quality vertical image showcasing the entire silhouette.</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Details & Tagging */}
                    <div className="space-y-6">
                        {/* Details Card */}
                        <div className="bg-background rounded-2xl p-6 border border-border shadow-sm space-y-5">
                            <h2 className="font-semibold text-foreground border-b border-border pb-3">Look Details</h2>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Look Title *</label>
                                <input required type="text" placeholder="e.g. Minimalist Autumn Wardrobe"
                                    value={title} onChange={e => setTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Styling Notes</label>
                                <textarea placeholder="Describe the aesthetic and materials..." rows={3}
                                    value={description} onChange={e => setDescription(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-foreground">Occasions (Up to 3) *</label>
                                <div className="flex flex-wrap gap-2">
                                    {['casual', 'office', 'wedding', 'party', 'vacation', 'streetwear', 'athletic', 'festival'].map(occ => (
                                        <button key={occ} type="button" onClick={() => toggleOccasion(occ)}
                                            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize border transition-all 
                                                ${occasion.includes(occ) ? 'bg-foreground text-background border-foreground' : 'bg-background text-foreground border-border hover:border-primary'}
                                            `}
                                        >
                                            {occ}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5 pt-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Budget Range *</label>
                                    <select
                                        value={budgetRange} onChange={e => setBudgetRange(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    >
                                        <option value="budget">Budget</option>
                                        <option value="mid-range">Mid-Range</option>
                                        <option value="luxury">Luxury</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Gender *</label>
                                    <select
                                        value={gender} onChange={e => setGender(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    >
                                        <option value="women">Women</option>
                                        <option value="men">Men</option>
                                        <option value="unisex">Unisex</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Tag Products Card */}
                        <div className="bg-background rounded-2xl p-6 border border-border shadow-sm space-y-4">
                            <h2 className="font-semibold text-foreground border-b border-border pb-3">Global Product Tagging</h2>

                            {/* Search Box */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search any product or brand..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-muted/30 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Search Results */}
                            {isSearching ? (
                                <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                            ) : searchResults.length > 0 ? (
                                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {searchResults.map(product => {
                                        const isSelected = selectedProducts.some(p => p._id === product._id);
                                        return (
                                            <div key={product._id}
                                                onClick={() => toggleProduct(product)}
                                                className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/30'}`}
                                            >
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary shrink-0">
                                                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                                                    <p className="text-[10px] text-muted-foreground truncate">{product.brand} • {product.sellerId?.storeName || 'Seller'}</p>
                                                </div>
                                                <div className="text-sm font-semibold mr-2">₹{product.price}</div>
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-border'}`}>
                                                    {isSelected && <CheckCircle2 className="w-3 h-3" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : searchQuery.length >= 2 && (
                                <p className="text-sm text-center text-muted-foreground py-4">No products found for "{searchQuery}"</p>
                            )}

                            {/* Selected Products Area */}
                            {selectedProducts.length > 0 && (
                                <div className="pt-4 border-t border-border">
                                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Tagged Items ({selectedProducts.length})</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedProducts.map(product => (
                                            <div key={product._id} className="flex items-center gap-2 bg-secondary/50 pl-2 pr-1 py-1 rounded-full border border-border">
                                                <span className="text-xs font-medium truncate max-w-[120px]">{product.name}</span>
                                                <button onClick={(e) => { e.stopPropagation(); toggleProduct(product); }} className="p-0.5 hover:bg-muted rounded-full transition-colors">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex justify-between items-center text-sm font-medium p-3 bg-muted/30 rounded-xl">
                                        <span className="text-muted-foreground">Total Outfit Value:</span>
                                        <span className="text-foreground text-lg">₹{selectedProducts.reduce((s, p) => s + p.price, 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
