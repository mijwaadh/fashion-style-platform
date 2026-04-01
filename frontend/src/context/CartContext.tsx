'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';

export interface CartItem {
    productId: string;
    ownerId:  string;
    name:      string;
    imageUrl:  string;
    price:     number;
    quantity:  number;
    size?:     string;
    color?:    string;
}

interface CartContextValue {
    items:          CartItem[];
    cartCount:      number;
    cartTotal:      number;
    isOpen:         boolean;
    openCart:       () => void;
    closeCart:      () => void;
    addToCart:      (productId: string, quantity?: number, size?: string, color?: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => Promise<void>;
    removeFromCart: (productId: string, size?: string, color?: string) => Promise<void>;
    refreshCart:    () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [initialized, setInitialized] = useState(false);

    const refreshCart = useCallback(async () => {
        try {
            const userStr = sessionStorage.getItem('aura_user');
            if (!userStr) { setItems([]); return; }
            const cart = await api.get<{ items: CartItem[] }>('/api/cart');
            setItems(cart.items ?? []);
        } catch {
            setItems([]);
        }
    }, []);

    useEffect(() => {
        refreshCart().finally(() => setInitialized(true));
    }, [refreshCart]);

    const addToCart = async (productId: string, quantity = 1, size?: string, color?: string) => {
        await api.post('/api/cart/add', { productId, quantity, size, color });
        await refreshCart();
        setIsOpen(true);
    };

    const updateQuantity = async (productId: string, quantity: number, size?: string, color?: string) => {
        // Optimistic update
        const prevItems = [...items];
        setItems(current => current.map(item => 
            (item.productId === productId && item.size === size && item.color === color)
                ? { ...item, quantity }
                : item
        ));

        try {
            await api.put('/api/cart/update', { productId, quantity, size, color });
            // Optionally refresh to sync with server's final state (stock limits, etc.)
            await refreshCart();
        } catch (err) {
            setItems(prevItems);
            console.error("Failed to update quantity:", err);
        }
    };

    const removeFromCart = async (productId: string, size?: string, color?: string) => {
        // Optimistic update
        const prevItems = [...items];
        setItems(current => current.filter(item => 
            !(item.productId === productId && item.size === size && item.color === color)
        ));

        try {
            const params = new URLSearchParams();
            if (size) params.set('size', size);
            if (color) params.set('color', color);
            await api.delete(`/api/cart/remove/${productId}?${params.toString()}`);
            await refreshCart();
        } catch (err) {
            setItems(prevItems);
            console.error("Failed to remove from cart:", err);
        }
    };

    const cartCount = items.reduce((s, i) => s + i.quantity, 0);
    const cartTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

    return (
        <CartContext.Provider value={{
            items, cartCount, cartTotal, isOpen,
            openCart: () => setIsOpen(true),
            closeCart: () => setIsOpen(false),
            addToCart, updateQuantity, removeFromCart, refreshCart,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
    return ctx;
}
