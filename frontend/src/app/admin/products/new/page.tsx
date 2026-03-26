'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, UploadCloud, AlertCircle, Loader2, X, Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import AdminGuard from '@/components/layout/AdminGuard';
import Navbar from '@/components/layout/Navbar';

function NewProductContent() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [price, setPrice] = useState('');
    const [mainCategory, setMainCategory] = useState('MEN FASHION');
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [productType, setProductType] = useState('');
    const [colors, setColors] = useState('');
    const [material, setMaterial] = useState('');
    const [sizes, setSizes] = useState('');
    const [url, setUrl] = useState('');
    const [inStock, setInStock] = useState(true);

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const TAXONOMY: any = {
        "MEN FASHION": {
            "Men Clothing": {
                "Men Top Wear": ["T-Shirts", "Shirts", "Personalized T-Shirts", "Jumpsuits", "Swim Suits", "Top & Bottom Sets"],
                "Men Bottom Wear": ["Jeans", "Shorts", "Track Pants", "Trousers", "Three Fourths", "Dungarees", "Swimming Shorts", "Top & Bottom Sets", "Suit Sets"]
            },
            "Men Ethnic Wear": {
                "Traditional": ["Dhoti / Mundu / Lungi", "Ethnic Jackets", "Kurta Sets", "Kurtas", "Sherwanis"]
            },
            "Men Sportswear": {
                "Activewear": ["Active Shorts", "Gym Vest", "Tracksuits"]
            },
            "Men Innerwear & Sleepwear": {
                "Essentials": ["Boxers", "Briefs", "Lounge Pants", "Trunks", "Vests", "Night Suits"]
            },
            "Men Winter Wear": {
                "Outerwear": ["Blazers", "Jackets", "Sweaters", "Sweatshirts", "Shrugs", "Thermal Topwear", "Thermal Bottomwear", "Thermal Sets", "Shawls"]
            },
            "Men FOOTWEAR": {
                "Shoes": ["Casual Shoes", "Formal Shoes", "Sports Shoes", "Sneakers", "Loafers", "Boots", "Safety Shoes"],
                "Flip Flops & Sandals": ["Flip Flops", "Sliders", "Clogs", "Sandals", "Floaters"],
                "Ethnic Footwear": ["Mojaris", "Juttis", "Other Ethnic Flats"]
            },
            "MEN ACCESSORIES": {
                "Belts": ["Belts"],
                "Caps & Hats": ["Caps", "Hats"],
                "Mufflers & Gloves": ["Gloves", "Mufflers", "Scarves", "Bandana"],
                "Jewellery": ["Chains", "Bracelets", "Finger Rings", "Necklace", "Men Earrings"],
                "Watches": ["Analog Watches", "Chronograph Watches", "Sports Watches", "Digital Watches"],
                "Glasses": ["Sunglasses", "Reading Glasses", "Computer Glasses", "Frames"]
            }
        },
        "WOMEN FASHION": {
            "Ethnic Wear": {
                "Kurtis & Sets": ["Kurtis", "Kurti Fabrics", "Kurti With Dupatta", "Kurti With Bottomwear", "Kurti With Dupatta & Bottomwear"],
                "Sarees & Blouses": ["Saree Shapewear & Petticoats", "Blouses", "Blouse Piece", "Ready To Wear Sarees", "Sarees With Stitched Blouse"],
                "Suits": ["Semi-Stitched Suits"],
                "Bottomwear": ["Churidars", "Patialas", "Salwars", "Sharara"],
                "Dupattas & Shawls": ["Dupattas", "Shawls"],
                "Gowns & Kaftans": ["Ethnic Gowns", "Kaftans"],
                "Lehenga Choli": ["Lehenga", "Ready To Wear Lehenga"],
                "Islamic Wear": ["Hijab", "Niqab", "Abayas", "Burqa"]
            },
            "WOMEN FOOTWEAR": {
                "Flats": ["Flats", "Platforms"],
                "Boots": ["Boots"],
                "Heels": ["Stilettos", "Pumps"],
                "Flipflops & Slippers": ["Sliders", "Clogs"],
                "Shoes": ["Formal Shoes", "Casual Shoes", "Sports Shoes", "Sneakers", "Loafers & Moccasins"],
                "Sandals": ["Flat Sandals", "Wedge Sandals", "Platform Sandals", "Heel Sandals"],
                "Bellies & Juttis": ["Bellies", "Juttis", "Mojaris"],
                "Wedges": ["Wedges"]
            },
            "WOMEN INNERWEAR & SLEEPWEAR": {
                "Nightsuits": ["Babydolls", "Nightdress", "Nightsuits", "Pyjamas"],
                "Bras & Lingerie": ["Bra", "Lingerie Sets", "Stockings", "Briefs", "Shapewear"]
            },
            "WOMEN SPORTS & ACTIVEWEAR": {
                "Sportswear": ["Swimwear", "Active Tank Top", "Tracksuits", "Gym Socks", "Tenniswear"],
                "Innerwear": ["Sports Bra"],
                "Activewear": ["Active Bottomwear", "Active Topwear", "Active Clothing Set", "Active Jackets & Sweatshirts"]
            },
            "WOMEN ACCESSORIES": {
                "Glasses": ["Sunglasses", "Reading Glasses", "Computer Glasses", "Frames"]
            }
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const validFiles = files.filter(file => {
                if (!file.type.startsWith('image/')) {
                    setError('Invalid file type detected.');
                    return false;
                }
                if (file.size > 5 * 1024 * 1024) {
                    setError('One or more images are too large (max 5MB).');
                    return false;
                }
                return true;
            });
            if (validFiles.length === 0) return;
            setImageFiles(prev => [...prev, ...validFiles].slice(0, 5));
            const newPreviews = validFiles.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 5));
        }
    };

    const removeImage = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name || !brand || !price || !mainCategory || !category || !subCategory || !productType || imageFiles.length === 0) {
            setError('Please fill in all required fields and upload at least one image.');
            return;
        }

        setLoading(true);

        try {
            const userStr = sessionStorage.getItem('aura_user');
            const token = userStr ? JSON.parse(userStr).token : '';

            const uploadPromises = imageFiles.map(async (file) => {
                const formData = new FormData();
                formData.append('image', file);
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Image upload failed.');
                return data;
            });

            const uploadedImages = await Promise.all(uploadPromises);

            await api.post('/api/products', {
                name,
                description: `${brand} ${productType} for ${mainCategory}`,
                brand,
                price: Number(price),
                mainCategory,
                category,
                subCategory,
                productType,
                attributes: {
                    colors: colors.split(',').map(c => c.trim()).filter(c => c !== ''),
                    material,
                    size: sizes.split(',').map(s => s.trim()).filter(s => s !== ''),
                },
                imageUrl: uploadedImages[0].url,
                imageOriginal: uploadedImages[0].url,
                imageTransparent: uploadedImages[0].transparentUrl || uploadedImages[0].url,
                images: uploadedImages.map(img => img.url),
                productUrl: url,
                inStock
            });

            router.push('/admin/products');
        } catch (err: any) {
            setError(err.message || 'Failed to create product.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            <Navbar />
            <main className="max-w-5xl mx-auto px-4 mt-8 md:mt-12">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href="/admin/products"><ChevronLeft className="w-5 h-5" /></Link>
                    </Button>
                    <div>
                        <div className="text-sm text-muted-foreground mb-0.5">
                            <Link href="/admin/products" className="text-primary font-medium hover:underline">Products</Link>
                            <span className="mx-1">›</span> New Product
                        </div>
                        <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-2">
                            <Package className="w-7 h-7 text-primary" /> Create New Product
                        </h1>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 animate-in slide-in-from-top-2 duration-300 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Image Section */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-background rounded-3xl p-6 border border-border shadow-sm sticky top-24">
                            <h2 className="font-bold text-lg text-foreground mb-4 font-serif">Product Visuals</h2>

                            <div className="relative aspect-[3/4] w-full rounded-2xl border-2 border-dashed border-border hover:border-primary transition-all bg-muted/30 overflow-hidden group cursor-pointer">
                                {imagePreviews[0] ? (
                                    <>
                                        <Image src={imagePreviews[0]} alt="Main Preview" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button type="button" variant="secondary" size="sm" className="rounded-full font-bold" onClick={(e) => { e.stopPropagation(); removeImage(0); }}>
                                                Change
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                                        <UploadCloud className="w-10 h-10 mb-3 opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all" />
                                        <p className="text-sm font-bold text-foreground">Click to upload</p>
                                        <p className="text-xs mt-1">Main Cover Photo</p>
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" disabled={imagePreviews.length > 0} />
                            </div>

                            <div className="grid grid-cols-4 gap-2 mt-4">
                                {imagePreviews.slice(1).map((preview, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl border border-border overflow-hidden bg-muted group">
                                        <Image src={preview} alt="Sub Preview" fill className="object-cover" />
                                        <button type="button" onClick={() => removeImage(idx + 1)} className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {imagePreviews.length > 0 && imagePreviews.length < 5 && (
                                    <div className="relative aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary transition-all flex items-center justify-center cursor-pointer">
                                        <Plus className="w-4 h-4 text-muted-foreground" />
                                        <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-4 italic text-center">High quality JPG/PNG recommended. Max 5 images.</p>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-background rounded-3xl p-8 border border-border shadow-sm space-y-8">
                            <div className="space-y-6">
                                <h3 className="font-bold text-xl text-foreground font-serif border-b border-border pb-2 inline-block">General Info</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Product Name *</label>
                                        <input required type="text" placeholder="e.g. Minimalist Linen Shirt" value={name} onChange={e => setName(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Brand Name *</label>
                                        <input required type="text" placeholder="e.g. Aura Couture" value={brand} onChange={e => setBrand(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Price (₹) *</label>
                                        <input required type="number" min="0" placeholder="2999" value={price} onChange={e => setPrice(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Stock Status</label>
                                        <div className="flex items-center gap-3 h-[52px] bg-muted/10 border border-border rounded-2xl px-5">
                                            <input type="checkbox" id="inStock" checked={inStock} onChange={e => setInStock(e.target.checked)} className="w-5 h-5 rounded-lg border-2 border-border text-primary focus:ring-primary" />
                                            <label htmlFor="inStock" className="text-sm font-medium cursor-pointer">Available for purchase</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="font-bold text-xl text-foreground font-serif border-b border-border pb-2 inline-block">Product Taxonomy</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Main Category</label>
                                        <select value={mainCategory} onChange={e => setMainCategory(e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none">
                                            {Object.keys(TAXONOMY).map(mc => <option key={mc} value={mc}>{mc}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Category</label>
                                        <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none">
                                            <option value="">Select Category</option>
                                            {mainCategory && TAXONOMY[mainCategory] && Object.keys(TAXONOMY[mainCategory]).map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Sub Category</label>
                                        <select required value={subCategory} onChange={e => setSubCategory(e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none">
                                            <option value="">Select Sub Category</option>
                                            {category && TAXONOMY[mainCategory][category] && Object.keys(TAXONOMY[mainCategory][category]).map(sc => <option key={sc} value={sc}>{sc}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Product Type</label>
                                        <select required value={productType} onChange={e => setProductType(e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none">
                                            <option value="">Select Type</option>
                                            {subCategory && TAXONOMY[mainCategory][category][subCategory] && TAXONOMY[mainCategory][category][subCategory].map((pt: any) => <option key={pt} value={pt}>{pt}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="font-bold text-xl text-foreground font-serif border-b border-border pb-2 inline-block">Extended Specs</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Colors (Comma separated)</label>
                                        <input type="text" placeholder="Black, Navy, Sand" value={colors} onChange={e => setColors(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Material</label>
                                        <input type="text" placeholder="e.g. 100% Organic Linen" value={material} onChange={e => setMaterial(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Sizes (Comma separated)</label>
                                        <input type="text" placeholder="S, M, L, XL or 30, 32, 34" value={sizes} onChange={e => setSizes(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Official Purchase URL</label>
                                        <input type="url" placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <Button type="button" variant="outline" className="rounded-2xl px-8 h-12 font-bold" onClick={() => router.back()} disabled={loading}>
                                    Discard
                                </Button>
                                <Button type="submit" disabled={loading} className="rounded-2xl px-12 h-12 font-bold text-base shadow-lg shadow-primary/20 transition-all active:scale-95 bg-primary hover:bg-primary/90">
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Product'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default function NewAdminProductPage() {
    return (
        <AdminGuard>
            <NewProductContent />
        </AdminGuard>
    );
}
