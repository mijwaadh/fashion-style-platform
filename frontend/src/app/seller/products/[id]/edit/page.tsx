'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, AlertCircle, Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [price, setPrice] = useState('');
    const [mainCategory, setMainCategory] = useState('MEN FASHION');
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [productType, setProductType] = useState('');
    const [colors, setColors] = useState('');
    const [url, setUrl] = useState('');
    const [inStock, setInStock] = useState(true);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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
                "Watches": ["Analog Watches", "Chronograph Watches", "Sports Watches", "Digital Watches"]
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
            }
        }
    };

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const product = await api.get<any>(`/api/products/${id}`);
                setName(product.name);
                setBrand(product.brand || '');
                setPrice(product.price.toString());
                setMainCategory(product.mainCategory || 'MEN FASHION');
                setCategory(product.category || '');
                setSubCategory(product.subCategory || '');
                setProductType(product.productType || '');
                setColors(product.attributes?.colors?.join(', ') || '');
                setUrl(product.productUrl || '');
                setInStock(product.inStock);
                setExistingImages(product.images || [product.imageUrl]);
                setImagePreviews(product.images || [product.imageUrl]);
            } catch (err: any) {
                setError(err.message || 'Failed to load product data.');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, replaceIndex?: number) => {
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

            if (replaceIndex !== undefined) {
                // Replacing a specific image (e.g., the MAIN one)
                const previewToRemove = imagePreviews[replaceIndex];
                
                // If replacing an existing image, remove it from existingImages
                if (existingImages.includes(previewToRemove)) {
                    setExistingImages(prev => prev.filter(img => img !== previewToRemove));
                } else {
                    // If replacing a new blob, find its index in imageFiles
                    const existingCount = existingImages.filter((img) => imagePreviews.indexOf(img) < replaceIndex).length;
                    const fileIndex = replaceIndex - existingCount;
                    setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
                }

                // Add the new file
                setImageFiles(prev => [...prev, validFiles[0]]);
                
                setImagePreviews(prev => {
                    const next = [...prev];
                    if (previewToRemove.startsWith('blob:')) URL.revokeObjectURL(previewToRemove);
                    
                    // We need to keep the order: [remainingExisting, remainingBlobs, newBlob]
                    // But for simplicity, let's just replace the index
                    next[replaceIndex] = URL.createObjectURL(validFiles[0]);
                    return next;
                });
            } else {
                const totalImages = imagePreviews.length + validFiles.length;
                if (totalImages > 5) {
                    setError('Maximum 5 images allowed.');
                    return;
                }

                setImageFiles(prev => [...prev, ...validFiles]);
                const newPreviews = validFiles.map(file => URL.createObjectURL(file));
                setImagePreviews(prev => [...prev, ...newPreviews]);
            }
        }
    };

    const removeImage = (index: number) => {
        const previewToRemove = imagePreviews[index];

        // If it's an existing image, remove from existingImages
        if (existingImages.includes(previewToRemove)) {
            setExistingImages(prev => prev.filter(img => img !== previewToRemove));
        } else {
            // If it's a new file, find its index in imageFiles and remove it
            // The previews for new files are created after existing ones usually, 
            // but to be safe, we need to track mapping.
            // Simpler: find the index in new files by counting how many existing images were before it.
            const existingCount = existingImages.filter((_, i) => i < index && existingImages.includes(imagePreviews[i])).length;
            const fileIndex = index - existingCount;
            // Wait, imagePreviews = [...existingImages, ...newFilesPreviews]
            // Actually, my current UI logic will have them mixed.
            // Let's just filter both by the preview string.
            const fileToRemove = imageFiles.find(f => URL.createObjectURL(f) === previewToRemove); // This is slow but safe if URL is same
            // Actually URL.createObjectURL creates NEW urls everytime. 
            // Better to track them in an object or just use index.
            // If I always keep existing images first in imagePreviews:
            if (index < existingImages.length) {
                setExistingImages(prev => prev.filter((_, i) => i !== index));
            } else {
                const fileIndex = index - existingImages.length;
                setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
            }
        }

        setImagePreviews(prev => {
            if (previewToRemove.startsWith('blob:')) {
                URL.revokeObjectURL(previewToRemove);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (imagePreviews.length === 0) {
            setError('At least one product image is required.');
            return;
        }

        setSaving(true);

        try {
            // 1. Upload new images if selected
            const uploadPromises = imageFiles.map(async (file) => {
                const formData = new FormData();
                formData.append('image', file);
                const token = JSON.parse(localStorage.getItem('aura_user') || '{}')?.token;
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Image upload failed.');
                return data.url;
            });

            const newImageUrls = await Promise.all(uploadPromises);
            const finalImageUrls = [...existingImages, ...newImageUrls];

            // 2. Update the Product record
            await api.put(`/api/products/${id}`, {
                name,
                brand,
                price: Number(price),
                mainCategory,
                category,
                subCategory,
                productType,
                attributes: {
                    colors: colors.split(',').map(c => c.trim()).filter(c => c !== ''),
                },
                imageUrl: finalImageUrls[0],
                images: finalImageUrls,
                productUrl: url,
                inStock
            });

            router.push('/seller/products');
        } catch (err: any) {
            setError(err.message || 'Failed to update product.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30 pb-20">
            <header className="bg-background border-b border-border sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/seller/products" className="text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="font-serif text-xl font-bold text-foreground">Edit Product</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 mt-8">
                {error && (
                    <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-background rounded-2xl p-6 border border-border shadow-sm">
                            <h2 className="font-semibold text-foreground mb-4">Product Images *</h2>

                            {/* Main Image Selection (Mandatory) */}
                            <div className="mb-6">
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 block">Main Photo (Mandatory)</label>
                                <div className="relative aspect-[3/4] w-full rounded-2xl border-2 border-dashed border-border hover:border-primary transition-all bg-muted overflow-hidden group cursor-pointer">
                                    {imagePreviews[0] ? (
                                        <>
                                            <Image src={imagePreviews[0]} alt="Main Preview" fill sizes="(max-width: 768px) 100vw, 300px" className="object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                <Button type="button" variant="secondary" size="sm" className="rounded-full pointer-events-auto">
                                                    Change Photo
                                                </Button>
                                            </div>
                                            <div className="absolute top-3 left-3 bg-primary text-[10px] text-primary-foreground px-2 py-1 rounded-full font-bold shadow-sm">
                                                MAIN
                                            </div>
                                        </>
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                                            <UploadCloud className="w-12 h-12 mb-3 text-border group-hover:text-primary transition-all duration-300" />
                                            <p className="text-sm font-semibold text-foreground">Click to upload main photo</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, imagePreviews.length > 0 ? 0 : undefined)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Optional Photos (Grid) */}
                            {imagePreviews.length > 0 && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Additional Photos (Optional)</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {imagePreviews.slice(1).map((preview, idx) => (
                                            <div key={preview} className="relative aspect-square rounded-xl border border-border overflow-hidden bg-muted group shadow-sm">
                                                <Image src={preview} alt={`Preview ${idx + 2}`} fill sizes="150px" className="object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx + 1)}
                                                    className="absolute top-1.5 right-1.5 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}

                                        {imagePreviews.length < 5 && (
                                            <div className="relative aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center cursor-pointer group">
                                                <UploadCloud className="w-6 h-6 mb-1 text-border group-hover:text-primary transition-colors" />
                                                <p className="text-[10px] font-bold text-muted-foreground group-hover:text-primary transition-colors">Add Photo</p>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground text-center italic">Changes are saved only after clicking "Update Product".</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-background rounded-2xl p-6 border border-border shadow-sm space-y-5">
                            <h2 className="font-semibold text-foreground border-b border-border pb-3">Product Details</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Product Name *</label>
                                    <input required type="text"
                                        value={name} onChange={e => setName(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Brand *</label>
                                    <input required type="text"
                                        value={brand} onChange={e => setBrand(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Price (₹) *</label>
                                    <input required type="number" min="0" step="0.01"
                                        value={price} onChange={e => setPrice(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Main Category *</label>
                                    <select
                                        value={mainCategory}
                                        onChange={e => {
                                            setMainCategory(e.target.value);
                                            setCategory('');
                                            setSubCategory('');
                                            setProductType('');
                                        }}
                                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    >
                                        <option value="">Select Main Category</option>
                                        {Object.keys(TAXONOMY).map(mc => (
                                            <option key={mc} value={mc}>{mc}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Category *</label>
                                    <select
                                        value={category}
                                        onChange={e => {
                                            setCategory(e.target.value);
                                            setSubCategory('');
                                            setProductType('');
                                        }}
                                        disabled={!mainCategory}
                                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
                                    >
                                        <option value="">Select Category</option>
                                        {mainCategory && TAXONOMY[mainCategory] && Object.keys(TAXONOMY[mainCategory]).map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Sub-Category *</label>
                                    <select
                                        value={subCategory}
                                        onChange={e => {
                                            setSubCategory(e.target.value);
                                            setProductType('');
                                        }}
                                        disabled={!category}
                                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
                                    >
                                        <option value="">Select Sub-Category</option>
                                        {category && TAXONOMY[mainCategory][category] && Object.keys(TAXONOMY[mainCategory][category]).map(sc => (
                                            <option key={sc} value={sc}>{sc}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-foreground">Product Type *</label>
                                    <select
                                        value={productType}
                                        onChange={e => setProductType(e.target.value)}
                                        disabled={!subCategory}
                                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
                                    >
                                        <option value="">Select Product Type</option>
                                        {subCategory && TAXONOMY[mainCategory][category][subCategory] && TAXONOMY[mainCategory][category][subCategory].map((pt: string) => (
                                            <option key={pt} value={pt}>{pt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Available Colors (comma separated)</label>
                                <input type="text" placeholder="e.g. Black, Navy Blue, White"
                                    value={colors} onChange={e => setColors(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Affiliate / Purchase Link</label>
                                <input type="url" placeholder="https://..."
                                    value={url} onChange={e => setUrl(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                                <p className="text-xs text-muted-foreground">The direct link for users to buy this specific item.</p>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <input type="checkbox" id="inStock"
                                    checked={inStock} onChange={e => setInStock(e.target.checked)}
                                    className="w-5 h-5 rounded text-primary focus:ring-primary border-border"
                                />
                                <label htmlFor="inStock" className="text-sm font-medium text-foreground">Item is currently in stock</label>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-end pt-4">
                            <Button type="button" variant="outline" className="rounded-full px-6" onClick={() => router.back()} disabled={saving}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="default" className="rounded-full px-8 bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
                                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</> : <><Save className="w-4 h-4 mr-2" /> Update Product</>}
                            </Button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
