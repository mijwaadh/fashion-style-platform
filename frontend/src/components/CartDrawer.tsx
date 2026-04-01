'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

export default function CartDrawer() {
    const { items, isOpen, closeCart, cartTotal, updateQuantity, removeFromCart } = useCart();

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
                    onClick={closeCart}
                />
            )}

            {/* Drawer */}
            <aside
                className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-background border-l border-border shadow-2xl z-50 flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                        <h2 className="font-semibold text-foreground text-lg">My Bag</h2>
                        <span className="text-xs text-muted-foreground">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                    </div>
                    <button onClick={closeCart} className="p-2 rounded-full hover:bg-muted transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-16">
                            <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
                            <p className="font-semibold text-foreground mb-1">Your bag is empty</p>
                            <p className="text-sm text-muted-foreground mb-6">Add items from the store to get started</p>
                            <Button variant="default" className="rounded-full px-8" onClick={closeCart} asChild>
                                <Link href="/">Browse Products</Link>
                            </Button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={`${item.productId}-${item.size}-${item.color}`}
                                className="flex gap-4 p-3 bg-muted/40 rounded-xl border border-border/50">
                                <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="80px" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground text-sm line-clamp-2 leading-snug">{item.name}</p>
                                    <div className="flex gap-2 mt-1 flex-wrap">
                                        {item.size && <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground font-medium">{item.size}</span>}
                                        {item.color && <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full text-muted-foreground font-medium">{item.color}</span>}
                                    </div>
                                    <p className="font-bold text-foreground mt-1.5">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            onClick={() => item.quantity > 1
                                                ? updateQuantity(item.productId, item.quantity - 1, item.size, item.color)
                                                : removeFromCart(item.productId, item.size, item.color)}
                                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                        >
                                            {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3" />}
                                        </button>
                                        <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size, item.color)}
                                            className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t border-border px-5 py-5 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground text-sm">Subtotal</span>
                            <span className="font-bold text-foreground text-lg">₹{cartTotal.toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Delivery charges calculated at checkout.</p>
                        <Button asChild variant="default" className="w-full rounded-full h-12 font-bold text-base" onClick={closeCart}>
                            <Link href="/checkout">Proceed to Checkout →</Link>
                        </Button>
                    </div>
                )}
            </aside>
        </>
    );
}
