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
    const [salePrice, setSalePrice] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState('');
    const [mainCategory, setMainCategory] = useState('MEN FASHION');
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [productType, setProductType] = useState('');
    const [colors, setColors] = useState('');
    const [material, setMaterial] = useState('');
    const [sizes, setSizes] = useState('');
    const [url, setUrl] = useState('');
    const [listingType, setListingType] = useState<'native' | 'affiliate'>('native');
    const [stockQuantity, setStockQuantity] = useState('10');
    const [inStock, setInStock] = useState(true);
    const [description, setDescription] = useState('');

    // New Specifications State
    const [weightGms, setWeightGms] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [fabric, setFabric] = useState('');
    const [fit, setFit] = useState('');
    const [neck, setNeck] = useState('');
    const [occasion, setOccasion] = useState('');
    const [pattern, setPattern] = useState('');
    const [sleeveLength, setSleeveLength] = useState('');
    const [countryOfOrigin, setCountryOfOrigin] = useState('India');
    const [manufacturerName, setManufacturerName] = useState('');
    const [manufacturerAddress, setManufacturerAddress] = useState('');
    const [manufacturerPincode, setManufacturerPincode] = useState('');
    const [packerName, setPackerName] = useState('');
    const [packerAddress, setPackerAddress] = useState('');
    const [packerPincode, setPackerPincode] = useState('');
    const [importerName, setImporterName] = useState('');
    const [importerAddress, setImporterAddress] = useState('');
    const [importerPincode, setImporterPincode] = useState('');
    const [sellerComment, setSellerComment] = useState('');

    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const SPEC_OPTIONS = {
        fabric: ["Cotton", "Polyester", "Silk", "Linen", "Viscose", "Rayon", "Denim", "Nylon", "Wool", "Blend", "Other"],
        fit: ["Regular Fit", "Slim Fit", "Relaxed Fit", "Loose Fit", "Boxy Fit", "Skinny Fit", "Oversized"],
        neck: ["Round Neck", "V-Neck", "Hooded", "Polo Neck", "Collared", "Boat Neck", "Cowl Neck", "Turtle Neck", "Scoop Neck", "Mandarin Collar", "Off-Shoulder"],
        occasion: ["Casual", "Formal", "Party", "Workwear", "Sports", "Ethnic", "Wedding", "Travel", "Beachwear", "Lounge"],
        pattern: ["Solid", "Printed", "Striped", "Checkered", "Self Design", "Embroidered", "Graphic Print", "Colorblock", "Floral", "Animal Print"],
        sleeve_length: ["Short Sleeves", "Long Sleeves", "Three-Quarter Sleeves", "Sleeveless", "Half Sleeves"],
        country: ["India", "China", "Bangladesh", "Vietnam", "Turkey", "Italy", "France", "USA", "UK", "Other"],
        colors: ["Aqua Blue", "Black", "Blue", "Brown", "Coral", "Gold", "Green", "Grey", "Indigo Blue", "Maroon", "Navy Blue", "Olive Green", "Orange", "Pink", "Purple", "Red", "White", "Yellow", "Beige", "Silver", "Multi"]
    };

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

            const attributes = {
                colors: colors.split(',').map(c => c.trim()).filter(Boolean),
                size: sizes.split(',').map(s => s.trim()).filter(Boolean),
                material: material
            };

            await api.post('/api/products', {
                name,
                description: description || `${brand} ${productType} for ${mainCategory}`,
                brand,
                price: Number(price),
                salePrice: salePrice ? Number(salePrice) : Number(price),
                discountPercentage: discountPercentage ? Number(discountPercentage) : 0,
                mainCategory,
                category,
                subCategory,
                productType,
                specifications: {
                    weight_gms: Number(weightGms),
                    supplier_id: supplierId,
                    fabric,
                    fit,
                    neck,
                    occasion,
                    pattern,
                    sleeve_length: sleeveLength,
                    country_of_origin: countryOfOrigin,
                    manufacturer_name: manufacturerName,
                    manufacturer_address: manufacturerAddress,
                    manufacturer_pincode: Number(manufacturerPincode),
                    packer_name: packerName,
                    packer_address: packerAddress,
                    packer_pincode: Number(packerPincode),
                    importer_name: importerName,
                    importer_address: importerAddress,
                    importer_pincode: Number(importerPincode),
                    seller_comment: sellerComment
                },
                attributes,
                imageUrl: uploadedImages[0].url,
                imageOriginal: uploadedImages[0].url,
                imageTransparent: uploadedImages[0].transparentUrl || uploadedImages[0].url,
                images: uploadedImages.map(img => img.url),
                productUrl: url,
                listingType,
                stockQuantity: listingType === 'native' ? Number(stockQuantity) : 0,
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
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Product Description (Comment) *</label>
                                        <textarea required rows={4} placeholder="Detailed product description..." value={description} onChange={e => setDescription(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Price (MRP) *</label>
                                        <input required type="number" min="0" placeholder="5999" value={price} 
                                            onChange={e => {
                                                const p = e.target.value;
                                                setPrice(p);
                                                if (p && salePrice) {
                                                    const disc = Math.round((1 - Number(salePrice)/Number(p)) * 100);
                                                    setDiscountPercentage(String(disc));
                                                }
                                            }}
                                            className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Sale Price (Discounted)</label>
                                        <input type="number" min="0" placeholder="1800" value={salePrice} 
                                            onChange={e => {
                                                const sp = e.target.value;
                                                setSalePrice(sp);
                                                if (price && sp) {
                                                    const disc = Math.round((1 - Number(sp)/Number(price)) * 100);
                                                    setDiscountPercentage(String(disc));
                                                }
                                            }}
                                            className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-bold text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Discount %</label>
                                        <input type="number" min="0" max="100" placeholder="70" value={discountPercentage} 
                                            onChange={e => {
                                                const d = e.target.value;
                                                setDiscountPercentage(d);
                                                if (price && d) {
                                                    const sp = Math.round(Number(price) * (1 - Number(d)/100));
                                                    setSalePrice(String(sp));
                                                }
                                            }}
                                            className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-bold text-green-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Listing Type *</label>
                                        <select 
                                            value={listingType} 
                                            onChange={e => setListingType(e.target.value as any)}
                                            className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                                        >
                                            <option value="native">Native (Direct Sale)</option>
                                            <option value="affiliate">Affiliate (External Link)</option>
                                        </select>
                                    </div>
                                    {listingType === 'native' ? (
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground ml-1">Stock Quantity *</label>
                                            <input 
                                                required 
                                                type="number" 
                                                min="1" 
                                                placeholder="10" 
                                                value={stockQuantity} 
                                                onChange={e => setStockQuantity(e.target.value)}
                                                className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" 
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-foreground ml-1">Stock Status</label>
                                            <div className="flex items-center gap-3 h-[52px] bg-muted/10 border border-border rounded-2xl px-5">
                                                <input type="checkbox" id="inStock" checked={inStock} onChange={e => setInStock(e.target.checked)} className="w-5 h-5 rounded-lg border-2 border-border text-primary focus:ring-primary" />
                                                <label htmlFor="inStock" className="text-sm font-medium cursor-pointer">Available for purchase</label>
                                            </div>
                                        </div>
                                    )}
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
                                <h3 className="font-bold text-xl text-foreground font-serif border-b border-border pb-2 inline-block">Extended Specs & Logistics</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Net Weight (gms)</label>
                                        <input type="number" placeholder="Enter Net Weight" value={weightGms} onChange={e => setWeightGms(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Product ID (Style Code)</label>
                                        <input type="text" placeholder="Enter Style Code" value={supplierId} onChange={e => setSupplierId(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                                    </div>
                                    
                                    {/* Dropdowns */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Fabric</label>
                                        <select value={fabric} onChange={e => setFabric(e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none">
                                            <option value="">Select Fabric</option>
                                            {SPEC_OPTIONS.fabric.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Fit / Shape</label>
                                        <select value={fit} onChange={e => setFit(e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none">
                                            <option value="">Select Fit</option>
                                            {SPEC_OPTIONS.fit.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Neck Line</label>
                                        <select value={neck} onChange={e => setNeck(e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none">
                                            <option value="">Select Neck</option>
                                            {SPEC_OPTIONS.neck.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Occasion</label>
                                        <select value={occasion} onChange={e => setOccasion(e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none">
                                            <option value="">Select Occasion</option>
                                            {SPEC_OPTIONS.occasion.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Pattern</label>
                                        <select value={pattern} onChange={e => setPattern(e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none">
                                            <option value="">Select Pattern</option>
                                            {SPEC_OPTIONS.pattern.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Sleeve Length</label>
                                        <select value={sleeveLength} onChange={e => setSleeveLength(e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none">
                                            <option value="">Select Sleeves</option>
                                            {SPEC_OPTIONS.sleeve_length.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Country of Origin</label>
                                        <select value={countryOfOrigin} onChange={e => setCountryOfOrigin(e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none">
                                            {SPEC_OPTIONS.country.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Colors (Select main / list comma separated)</label>
                                        <input type="text" placeholder="e.g. Aqua Blue, Black" value={colors} onChange={e => setColors(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                                    </div>

                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Available Sizes *</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size'].map(s => {
                                                const currentSizes = sizes.split(',').map(x => x.trim()).filter(Boolean);
                                                const isActive = currentSizes.includes(s);
                                                return (
                                                    <button
                                                        key={s}
                                                        type="button"
                                                        onClick={() => {
                                                            if (isActive) {
                                                                setSizes(currentSizes.filter(x => x !== s).join(', '));
                                                            } else {
                                                                setSizes([...currentSizes, s].join(', '));
                                                            }
                                                        }}
                                                        className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${
                                                            isActive 
                                                            ? 'bg-primary border-primary text-white shadow-md shadow-primary/20' 
                                                            : 'bg-background border-border text-foreground hover:border-primary/50'
                                                        }`}
                                                    >
                                                        {s}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="pt-2">
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest ml-1 mb-2">Custom Sizes (Optional)</p>
                                            <input type="text" placeholder="e.g. 32, 34, 36 (comma separated)" value={sizes} onChange={e => setSizes(e.target.value)}
                                                className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Manufacturing Details */}
                            <div className="space-y-6">
                                <h3 className="font-bold text-xl text-foreground font-serif border-b border-border pb-2 inline-block">Compliance & Manufacturing</h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="bg-muted/5 p-6 rounded-2xl border border-border/50 space-y-4">
                                        <h4 className="font-bold text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Manufacturer Details
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input type="text" placeholder="Manufacturer Name" value={manufacturerName} onChange={e => setManufacturerName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary" />
                                            <input type="number" placeholder="Manufacturer Pincode" value={manufacturerPincode} onChange={e => setManufacturerPincode(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary" />
                                            <input type="text" placeholder="Manufacturer Address" value={manufacturerAddress} onChange={e => setManufacturerAddress(e.target.value)} className="md:col-span-2 w-full px-4 py-2.5 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary" />
                                        </div>
                                    </div>

                                    <div className="bg-muted/5 p-6 rounded-2xl border border-border/50 space-y-4">
                                        <h4 className="font-bold text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Packer Details
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input type="text" placeholder="Packer Name" value={packerName} onChange={e => setPackerName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary" />
                                            <input type="number" placeholder="Packer Pincode" value={packerPincode} onChange={e => setPackerPincode(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary" />
                                            <input type="text" placeholder="Packer Address" value={packerAddress} onChange={e => setPackerAddress(e.target.value)} className="md:col-span-2 w-full px-4 py-2.5 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary" />
                                        </div>
                                    </div>

                                    <div className="bg-muted/5 p-6 rounded-2xl border border-border/50 space-y-4">
                                        <h4 className="font-bold text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Importer Details (If applicable)
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input type="text" placeholder="Importer Name" value={importerName} onChange={e => setImporterName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary" />
                                            <input type="number" placeholder="Importer Pincode" value={importerPincode} onChange={e => setImporterPincode(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary" />
                                            <input type="text" placeholder="Importer Address" value={importerAddress} onChange={e => setImporterAddress(e.target.value)} className="md:col-span-2 w-full px-4 py-2.5 rounded-xl border border-border bg-background outline-none focus:ring-2 focus:ring-primary" />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">Internal Seller Comments</label>
                                        <textarea rows={3} placeholder="Any internal notes or specifics..." value={sellerComment} onChange={e => setSellerComment(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="font-bold text-xl text-foreground font-serif border-b border-border pb-2 inline-block">Purchase Links</h3>
                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground ml-1">
                                            {listingType === 'native' ? 'Optional Product Link' : 'Purchase URL *'}
                                        </label>
                                        <input 
                                            type="url" 
                                            required={listingType === 'affiliate'}
                                            placeholder="https://..." 
                                            value={url} 
                                            onChange={e => setUrl(e.target.value)}
                                            className="w-full px-5 py-3 rounded-2xl border border-border bg-muted/10 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" 
                                        />
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
