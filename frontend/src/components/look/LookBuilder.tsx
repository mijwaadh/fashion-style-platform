import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, Trash2, Save, Sparkles, Loader2, Maximize2, Minimize2, Layers, MousePointer2, ChevronDown, ChevronUp, Shirt, ShoppingBag, Watch, Footprints, Users, User, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
    imageOriginal?: string;
    imageTransparent?: string;
    category: string;
    mainCategory?: string;
    subCategory?: string;
    brand?: string;
}

interface CanvasItem {
    product: Product;
    x: number;
    y: number;
    scale: number;
    zIndex: number;
    useOriginalImage?: boolean; // New field to toggle background
}

export default function LookBuilder() {
    const router = useRouter();
    const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [initialProducts, setInitialProducts] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [lookTitle, setLookTitle] = useState('');
    const [lookDescription, setLookDescription] = useState('');
    const [recommendations, setRecommendations] = useState<Product[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

    // Categorized selector state
    const [selectedGender, setSelectedGender] = useState<'MEN FASHION' | 'WOMEN FASHION'>('MEN FASHION');
    const [expandedCategory, setExpandedCategory] = useState<string | null>('Upper Wear');
    const [categoryProducts, setCategoryProducts] = useState<Record<string, Product[]>>({});
    const [isCategoryLoading, setIsCategoryLoading] = useState(false);

    const resizerBaseScale = useRef(1);
    const resizerFixedPoint = useRef({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);

    // Search products for the builder
    const searchItems = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const data = await api.get<Product[]>(`/api/products?q=${encodeURIComponent(query)}&limit=8`);
            setSearchResults(data || []);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Fetch initial products on mount
    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const data = await api.get<Product[]>('/api/products?limit=20');
                setInitialProducts(data || []);
            } catch (error) {
                console.error('Failed to fetch products', error);
            }
        };
        fetchInitial();
    }, []);

    // Fetch items for specific category and gender
    const fetchCategoryItems = useCallback(async (gender: string, categoryLabel: string) => {
        setIsCategoryLoading(true);
        try {
            // Map UI labels to backend search terms based on gender prefix and taxonomy
            let subCategoryQuery = '';
            const isMen = gender === 'MEN FASHION';

            if (categoryLabel === 'Upper Wear') {
                if (isMen) {
                    // Men: Top Wear + Ethnic Upper (Kurtas/Sherwanis) + Sports Upper
                    subCategoryQuery = 'Men Top Wear|Traditional|Activewear';
                } else {
                    // Women: Ethnic Upper + Sports Upper
                    // Added Kurtis & Sets and ethnic categories explicitly
                    subCategoryQuery = 'Kurtis & Sets|Sarees & Blouses|Suits|Gowns & Kaftans|Islamic Wear|Active Topwear|Ethnic Wear';
                }
            } else if (categoryLabel === 'Lower Wear') {
                if (isMen) {
                    // Men: Bottom Wear + Ethnic Lower (Dhoti/Lungi) + Sports Lower
                    subCategoryQuery = 'Men Bottom Wear|Active Shorts';
                } else {
                    // Women: Ethnic Lower + Sports Lower
                    subCategoryQuery = 'Bottomwear|Lehenga Choli|Active Bottomwear';
                }
            } else if (categoryLabel === 'Footwear') {
                // Footwear should be matched exactly to subCategory or category
                subCategoryQuery = isMen ? 'Men FOOTWEAR|Shoes|Sandals' : 'WOMEN FOOTWEAR|Flats|Heels|Shoes|Sandals';
            } else if (categoryLabel === 'Accessories') {
                subCategoryQuery = isMen ? 'MEN ACCESSORIES|Belts|Caps|Watches|Jewellery' : 'ACCESSORIES|Jewellery|Watches';
            }

            // Fetch with multiple subcategories using regex in backend
            const queryParams = new URLSearchParams({
                mainCategory: gender,
                subCategory: subCategoryQuery,
                limit: '20'
            });
            const data = await api.get<Product[]>(`/api/products?${queryParams.toString()}`);

            // Extra safety: Filter out items that mismatch our gender criteria on the client side
            const filteredData = (data || []).filter(p => {
                if (!p.mainCategory) return true; // Allow if missing as fallback
                return p.mainCategory.toUpperCase() === gender.toUpperCase();
            });

            setCategoryProducts(prev => ({ ...prev, [`${gender}-${categoryLabel}`]: filteredData }));
        } catch (error) {
            console.error('Failed to fetch category items', error);
        } finally {
            setIsCategoryLoading(false);
        }
    }, []);

    // Effect to fetch when gender or expanded category changes
    useEffect(() => {
        if (expandedCategory && !categoryProducts[`${selectedGender}-${expandedCategory}`]) {
            fetchCategoryItems(selectedGender, expandedCategory);
        }
    }, [selectedGender, expandedCategory, fetchCategoryItems, categoryProducts]);

    useEffect(() => {
        // Reset expanded category when gender changes
        setExpandedCategory('Upper Wear');
    }, [selectedGender]);

    useEffect(() => {
        const timer = setTimeout(() => searchItems(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery, searchItems]);

    // Fetch smart suggestions based on the last added item
    useEffect(() => {
        if (canvasItems.length > 0) {
            const lastProduct = canvasItems[canvasItems.length - 1].product;
            api.get<Product[]>(`/api/products/${lastProduct._id}/recommend-outfit`)
                .then(setRecommendations)
                .catch(() => setRecommendations([]));
        } else {
            setRecommendations([]);
        }
    }, [canvasItems]);

    const addProductToCanvas = (p: Product, x?: number, y?: number) => {
        if (canvasItems.find(item => item.product._id === p._id)) {
            toast.error('Product already on your canvas');
            return;
        }

        const newItem: CanvasItem = {
            product: p,
            x: x ?? (Math.random() * 50 + 50), // Fallback to randomized center if no x provided
            y: y ?? (Math.random() * 50 + 50),
            scale: 1,
            zIndex: canvasItems.length + 1
        };

        setCanvasItems([...canvasItems, newItem]);
        setActiveId(p._id);
        toast.success(`Added ${p.name}`);
    };

    const renderProductItem = (p: Product) => (
        <div
            key={p._id}
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData('product', JSON.stringify(p));
                e.dataTransfer.effectAllowed = 'move';
            }}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted transition-colors group cursor-pointer border border-transparent hover:border-primary/20"
            onClick={() => addProductToCanvas(p)}
        >
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-secondary">
                <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{p.brand}</p>
                <p className="text-xs font-black text-primary mt-1">₹{p.price.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-primary/10 text-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="w-4 h-4" />
            </div>
        </div>
    );

    const removeFromCanvas = (id: string) => {
        setCanvasItems(canvasItems.filter(item => item.product._id !== id));
        if (activeId === id) setActiveId(null);
    };

    const updateItem = (id: string, updates: Partial<CanvasItem>) => {
        setCanvasItems(canvasItems.map(item =>
            item.product._id === id ? { ...item, ...updates } : item
        ));
    };

    const bringToFront = (id: string) => {
        const maxZ = Math.max(...canvasItems.map(i => i.zIndex), 0);
        updateItem(id, { zIndex: maxZ + 1 });
    };

    const handleSave = async (status: 'draft' | 'published') => {
        if (canvasItems.length < 2) {
            toast.error('Please add at least 2 items to your look');
            return;
        }
        if (!lookTitle.trim()) {
            toast.error('Please give your look a title');
            return;
        }

        setIsPublishing(true);
        try {
            const canvas = canvasRef.current;
            if (!canvas) throw new Error("Canvas reference not found");

            const canvasWidth = canvas.clientWidth;
            const canvasHeight = canvas.clientHeight;

            const layoutMetadata: Record<string, any> = {};
            canvasItems.forEach(item => {
                layoutMetadata[item.product._id] = {
                    x: (item.x / canvasWidth) * 100,
                    y: (item.y / canvasHeight) * 100,
                    scale: item.scale,
                    zIndex: item.zIndex,
                    baseWidth: 192,
                    baseHeight: 256,
                    canvasWidth,
                    canvasHeight
                };
            });

            await api.post('/api/looks/user-created', {
                title: lookTitle,
                description: lookDescription || 'No description provided.',
                imageUrl: canvasItems[0].product.imageUrl,
                productsIncluded: canvasItems.map(item => item.product._id),
                totalEstimatedBudget: canvasItems.reduce((sum, item) => sum + item.product.price, 0),
                gender: 'unisex',
                budgetRange: 'mid-range',
                occasion: ['daily'],
                layoutMetadata,
                status
            });

            toast.success(status === 'published' ? 'Your look has been published!' : 'Look saved as draft');
            router.push('/saved?tab=my-outfits');
        } catch (error: any) {
            toast.error(error.message || 'Failed to save look');
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 p-4 md:p-8 bg-muted/30 min-h-screen">
            {/* Header / Nav - Mobile Back Button */}
            <div className="lg:hidden">
                <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium">
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Feed</span>
                </Link>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-120px)] animate-in fade-in duration-700">
                {/* Left: Product Selector */}
                <div className="w-full lg:w-[380px] flex flex-col gap-6">
                    <div className="bg-background border border-border rounded-3xl p-6 shadow-sm sticky top-24">
                        <h2 className="text-xl font-black text-foreground uppercase tracking-tight mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-primary" /> Selector
                        </h2>

                        <div className="relative mb-6">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Find items to style..."
                                className="w-full pl-11 pr-4 py-3 bg-muted border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary transition-all"
                            />
                        </div>

                        {/* Gender Toggle */}
                        <div className="flex bg-muted p-1 rounded-2xl mb-6">
                            <button
                                onClick={() => setSelectedGender('MEN FASHION')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${selectedGender === 'MEN FASHION' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground'}`}
                            >
                                <User className="w-3.5 h-3.5" /> Men
                            </button>
                            <button
                                onClick={() => setSelectedGender('WOMEN FASHION')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${selectedGender === 'WOMEN FASHION' ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground'}`}
                            >
                                <Users className="w-3.5 h-3.5" /> Women
                            </button>
                        </div>

                        {/* Categorized Dropdowns */}
                        <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                            {searchQuery ? (
                                // Search Results
                                isSearching ? (
                                    <div className="flex items-center justify-center py-10">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary/30" />
                                    </div>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(p => renderProductItem(p))
                                ) : (
                                    <p className="text-center py-10 text-xs text-muted-foreground">No items found.</p>
                                )
                            ) : (
                                // Categorized Views
                                [
                                    { label: 'Upper Wear', icon: Shirt },
                                    { label: 'Lower Wear', icon: Layers },
                                    { label: 'Footwear', icon: Footprints },
                                    { label: 'Accessories', icon: Watch }
                                ].map((cat) => (
                                    <div key={cat.label} className="border border-border/50 rounded-2xl overflow-hidden bg-background/50">
                                        <button
                                            onClick={() => setExpandedCategory(expandedCategory === cat.label ? null : cat.label)}
                                            className={`w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors ${expandedCategory === cat.label ? 'bg-muted/30' : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <cat.icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-bold text-foreground">{cat.label}</span>
                                            </div>
                                            {expandedCategory === cat.label ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                        </button>

                                        <AnimatePresence>
                                            {expandedCategory === cat.label && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden bg-background/20"
                                                >
                                                    <div className="p-2 space-y-1">
                                                        {isCategoryLoading && !categoryProducts[`${selectedGender}-${cat.label}`] ? (
                                                            <div className="flex items-center justify-center py-6">
                                                                <Loader2 className="w-5 h-5 animate-spin text-primary/30" />
                                                            </div>
                                                        ) : categoryProducts[`${selectedGender}-${cat.label}`]?.length > 0 ? (
                                                            categoryProducts[`${selectedGender}-${cat.label}`].map(p => renderProductItem(p))
                                                        ) : (
                                                            <p className="text-[10px] text-center py-4 text-muted-foreground">No items in this category.</p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Smart Suggestions */}
                        {recommendations.length > 0 && (
                            <div className="mt-8 border-t border-border pt-6">
                                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" /> Recommendations
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {recommendations.slice(0, 2).map(p => (
                                        <div
                                            key={p._id}
                                            draggable
                                            onDragStart={(e) => {
                                                e.dataTransfer.setData('product', JSON.stringify(p));
                                                e.dataTransfer.effectAllowed = 'move';
                                            }}
                                            onClick={() => addProductToCanvas(p)}
                                            className="relative aspect-[4/5] rounded-xl overflow-hidden bg-secondary cursor-pointer group border border-border hover:border-primary/30"
                                        >
                                            <Image src={p.imageUrl} alt={p.name} fill className="object-cover transition-transform" />
                                            <div className="absolute inset-x-2 bottom-2 bg-white/90 backdrop-blur-md p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-[8px] font-bold truncate">{p.name}</p>
                                                <p className="text-[8px] font-black text-primary">₹{p.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Styling Canvas */}
                <div className="flex-1 flex flex-col gap-4">
                    <div className="bg-background border border-border rounded-[40px] p-8 flex-1 flex flex-col shadow-sm overflow-hidden min-h-[600px]">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pb-8 border-b border-border">
                            <div className="flex items-center gap-6 flex-1 w-full">
                                <Link href="/" className="hidden lg:flex p-3 bg-muted rounded-2xl hover:bg-muted/80 transition-all text-muted-foreground hover:text-foreground group shadow-sm hover:shadow-md">
                                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                </Link>
                                <div className="flex-1 space-y-4">
                                    <input
                                        type="text"
                                        value={lookTitle}
                                        onChange={(e) => setLookTitle(e.target.value)}
                                        placeholder="Name your outfit"
                                        className="text-3xl font-serif font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/30 w-full"
                                    />
                                    <textarea
                                        value={lookDescription}
                                        onChange={(e) => setLookDescription(e.target.value)}
                                        placeholder="Description"
                                        className="text-muted-foreground bg-transparent border-none outline-none resize-none w-full text-sm font-medium"
                                        rows={1}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <Button
                                    variant="outline"
                                    className="rounded-full px-6 h-12 font-bold"
                                    onClick={() => handleSave('draft')}
                                    disabled={isPublishing || canvasItems.length < 2}
                                >
                                    {isPublishing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save as Draft'}
                                </Button>
                                <Button
                                    className="rounded-full px-10 h-12 font-black shadow-lg shadow-primary/20 bg-primary hover:scale-105 transition-all text-white"
                                    onClick={() => handleSave('published')}
                                    disabled={isPublishing || canvasItems.length < 2}
                                >
                                    {isPublishing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save & Publish'}
                                </Button>
                            </div>
                        </div>

                        {/* Canvas Container with Fixed Aspect Ratio */}
                        <div className="flex-1 flex items-center justify-center p-4">
                            <div
                                ref={canvasRef}
                                className="relative w-full max-w-[500px] aspect-[3/4] bg-[#F9F9F7] rounded-3xl border border-dashed border-border overflow-hidden cursor-crosshair group/canvas shadow-inner"
                                onClick={(e) => {
                                    if (e.target === e.currentTarget) setActiveId(null);
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = 'move';
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    try {
                                        const productData = e.dataTransfer.getData('product');
                                        if (!productData) return;
                                        const p = JSON.parse(productData);

                                        const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                                        // Calculate relative position within the 3:4 container
                                        // Since our base items are 192x256, we center them by subtracting half that
                                        const dropX = (e.clientX - rect.left) - 96;
                                        const dropY = (e.clientY - rect.top) - 128;

                                        addProductToCanvas(p, dropX, dropY);
                                    } catch (err) {
                                        console.error("Drop failed", err);
                                    }
                                }}
                            >
                                {canvasItems.length === 0 ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                                        <div className="p-4 bg-muted/20 rounded-full mb-4 shadow-sm">
                                            <MousePointer2 className="w-8 h-8 text-primary" />
                                        </div>
                                        <h3 className="font-serif text-2xl font-bold mb-2 text-foreground">Creative Canvas</h3>
                                        <p className="text-sm text-muted-foreground max-w-xs">
                                            Drag items from the selector on the left. Standard 3:4 portrait view for high-impact social discovery.
                                        </p>
                                    </div>
                                ) : (
                                    canvasItems.map((item) => (
                                        <motion.div
                                            key={item.product._id}
                                            drag
                                            dragMomentum={false}
                                            onDragEnd={(_, info) => {
                                                updateItem(item.product._id, {
                                                    x: item.x + info.offset.x,
                                                    y: item.y + info.offset.y
                                                });
                                            }}
                                            initial={false}
                                            animate={{
                                                x: item.x,
                                                y: item.y,
                                                scale: item.scale,
                                                zIndex: item.zIndex
                                            }}
                                            transition={activeId === item.product._id ? { type: "tween", duration: 0 } : { type: "spring", stiffness: 500, damping: 40, mass: 1 }}
                                            className={`absolute cursor-grab active:cursor-grabbing transition-shadow ${activeId === item.product._id ? 'z-[100]' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveId(item.product._id);
                                            }}
                                        >
                                            <div className={`relative group p-1 transition-all duration-300 ${activeId === item.product._id ? 'rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5' : ''}`}>
                                                <div className="relative w-48 h-64 bg-transparent">
                                                    <Image
                                                        // Prioritize transparent background image for the canvas, fallback to original if toggled or on error
                                                        src={
                                                            (imageErrors[item.product._id] || item.useOriginalImage)
                                                                ? item.product.imageUrl
                                                                : (item.product.imageTransparent || item.product.imageUrl)
                                                        }
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-contain p-2"
                                                        sizes="(max-width: 768px) 30vw, 200px"
                                                        draggable={false}
                                                        onError={() => {
                                                            setImageErrors(prev => ({ ...prev, [item.product._id]: true }));
                                                        }}
                                                    />

                                                    {/* Item Controls - Overlay */}
                                                    <AnimatePresence>
                                                        {activeId === item.product._id && (
                                                            <>
                                                                {/* Top bar for layering and removal */}
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: -10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -10 }}
                                                                    className="absolute -top-4 -right-4 flex flex-col gap-2 pointer-events-none"
                                                                >
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); bringToFront(item.product._id); }}
                                                                        className="p-2 bg-black/80 backdrop-blur-md rounded-full text-white pointer-events-auto hover:text-primary transition-colors shadow-lg"
                                                                        title="Bring to Front"
                                                                    >
                                                                        <Layers className="w-3 h-3" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            updateItem(item.product._id, { useOriginalImage: !item.useOriginalImage });
                                                                        }}
                                                                        className={`p-2 backdrop-blur-md rounded-full text-white pointer-events-auto transition-colors shadow-lg ${item.useOriginalImage ? 'bg-primary' : 'bg-black/80 hover:text-primary'}`}
                                                                        title={item.useOriginalImage ? "Show Transparent" : "Show Original"}
                                                                    >
                                                                        <Sparkles className="w-3 h-3" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); removeFromCanvas(item.product._id); }}
                                                                        className="p-2 bg-black/80 backdrop-blur-md rounded-full text-white pointer-events-auto hover:text-red-500 transition-colors shadow-lg"
                                                                        title="Remove"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </motion.div>

                                                                {/* Resize Handles - Corner Only for precision with Fixed-Point Logic */}
                                                                {[
                                                                    {
                                                                        pos: '-top-2 -left-2 cursor-nw-resize',
                                                                        type: 'TL',
                                                                        getFixed: (i: any) => ({
                                                                            x: i.x + (192 * i.scale),
                                                                            y: i.y + (256 * i.scale)
                                                                        })
                                                                    },
                                                                    {
                                                                        pos: '-top-2 -right-2 cursor-ne-resize',
                                                                        type: 'TR',
                                                                        getFixed: (i: any) => ({
                                                                            x: i.x,
                                                                            y: i.y + (256 * i.scale)
                                                                        })
                                                                    },
                                                                    {
                                                                        pos: '-bottom-2 -left-2 cursor-sw-resize',
                                                                        type: 'BL',
                                                                        getFixed: (i: any) => ({
                                                                            x: i.x + (192 * i.scale),
                                                                            y: i.y
                                                                        })
                                                                    },
                                                                    {
                                                                        pos: '-bottom-2 -right-2 cursor-se-resize',
                                                                        type: 'BR',
                                                                        getFixed: (i: any) => ({
                                                                            x: i.x,
                                                                            y: i.y
                                                                        })
                                                                    },
                                                                ].map((handle) => (
                                                                    <motion.div
                                                                        key={handle.type}
                                                                        className={`absolute ${handle.pos} w-8 h-8 flex items-center justify-center pointer-events-auto z-[100]`}
                                                                        onPanStart={(e) => {
                                                                            e.stopPropagation();
                                                                            resizerBaseScale.current = item.scale;
                                                                            resizerFixedPoint.current = handle.getFixed(item);
                                                                        }}
                                                                        onPan={(_, info) => {
                                                                            const fixed = resizerFixedPoint.current;
                                                                            const rect = canvasRef.current?.getBoundingClientRect();
                                                                            if (!rect) return;

                                                                            // Current mouse position relative to canvas
                                                                            const mouseX = info.point.x - rect.left;
                                                                            const mouseY = info.point.y - rect.top;

                                                                            let newScale = item.scale;
                                                                            let newX = item.x;
                                                                            let newY = item.y;

                                                                            if (handle.type === 'BR') {
                                                                                // Fixed point is TL (item.x, item.y)
                                                                                newScale = Math.max(0.3, (mouseX - fixed.x) / 192);
                                                                            } else if (handle.type === 'TL') {
                                                                                // Fixed point is BR
                                                                                newScale = Math.max(0.3, (fixed.x - mouseX) / 192);
                                                                                newX = fixed.x - (192 * newScale);
                                                                                newY = fixed.y - (256 * newScale);
                                                                            } else if (handle.type === 'TR') {
                                                                                // Fixed point is BL
                                                                                newScale = Math.max(0.3, (mouseX - fixed.x) / 192);
                                                                                newY = fixed.y - (256 * newScale);
                                                                            } else if (handle.type === 'BL') {
                                                                                // Fixed point is TR
                                                                                newScale = Math.max(0.3, (fixed.x - mouseX) / 192);
                                                                                newX = fixed.x - (192 * newScale);
                                                                            }

                                                                            updateItem(item.product._id, {
                                                                                scale: newScale,
                                                                                x: newX,
                                                                                y: newY
                                                                            });
                                                                        }}
                                                                    >
                                                                        <div className="w-3 h-3 bg-primary rounded-full shadow-lg border-2 border-white ring-2 ring-primary/20 scale-100 hover:scale-125 transition-transform" />
                                                                    </motion.div>
                                                                ))}
                                                            </>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}

                                {/* Legend */}
                                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-border text-[10px] font-bold text-muted-foreground uppercase tracking-widest shadow-sm pointer-events-none opacity-0 group-hover/canvas:opacity-100 transition-opacity">
                                    Drag to Move • Click to Edit
                                </div>
                            </div>
                        </div>

                        {/* Footer Stats */}
                        {canvasItems.length > 0 && (
                            <div className="mt-8 flex justify-between items-center text-sm font-medium">
                                <div className="text-muted-foreground">
                                    <span className="text-foreground font-black">{canvasItems.length}</span> Items Selected
                                </div>
                                <div className="text-primary font-black text-xl">
                                    ₹{canvasItems.reduce((sum, i) => sum + i.product.price, 0).toLocaleString()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
