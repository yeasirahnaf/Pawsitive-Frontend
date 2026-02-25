'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface CartItem {
    id: string;
    pet_id: string;
    pet: {
        id: string;
        name: string;
        species: string;
        breed: string;
        price: number;
        thumbnail_url: string | null;
    };
}

interface CartContextValue {
    items: CartItem[];
    itemCount: number;
    sessionId: string;
    isLoading: boolean;
    fetchCart: (token?: string | null) => Promise<void>;
    addItem: (petId: string, token?: string | null) => Promise<void>;
    removeItem: (itemId: string, token?: string | null) => Promise<void>;
    syncCart: (token: string) => Promise<void>;
    clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

function getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return '';
    let sid = localStorage.getItem('paws_session');
    if (!sid) {
        sid = uuidv4();
        localStorage.setItem('paws_session', sid);
    }
    return sid;
}

function buildHeaders(token?: string | null, sessionId?: string) {
    const h: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = `Bearer ${token}`;
    if (sessionId) h['X-Session-Id'] = sessionId;
    return h;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [sessionId, setSessionId] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setSessionId(getOrCreateSessionId());
    }, []);

    const fetchCart = useCallback(async (token?: string | null) => {
        const sid = getOrCreateSessionId();
        setIsLoading(true);
        try {
            const res = await fetch(`${API}/api/v1/cart`, { headers: buildHeaders(token, sid) });
            const data = await res.json();
            if (res.ok) setItems(data.data ?? []);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const addItem = useCallback(async (petId: string, token?: string | null) => {
        const sid = getOrCreateSessionId();
        const res = await fetch(`${API}/api/v1/cart/items`, {
            method: 'POST',
            headers: buildHeaders(token, sid),
            body: JSON.stringify({ pet_id: petId }),
        });
        const data = await res.json();
        if (res.ok) setItems((prev) => [...prev, data.data]);
        else throw new Error(data.message ?? 'Could not add to cart');
    }, []);

    const removeItem = useCallback(async (itemId: string, token?: string | null) => {
        const sid = getOrCreateSessionId();
        const res = await fetch(`${API}/api/v1/cart/items/${itemId}`, {
            method: 'DELETE',
            headers: buildHeaders(token, sid),
        });
        if (res.ok) setItems((prev) => prev.filter((i) => i.id !== itemId));
    }, []);

    const syncCart = useCallback(async (token: string) => {
        const sid = getOrCreateSessionId();
        if (!sid) return;
        const res = await fetch(`${API}/api/v1/cart`, {
            method: 'PUT',
            headers: buildHeaders(token, sid),
            body: JSON.stringify({ session_id: sid }),
        });
        const data = await res.json();
        if (res.ok) setItems(data.data ?? []);
    }, []);

    const clearCart = useCallback(() => setItems([]), []);

    return (
        <CartContext.Provider
            value={{ items, itemCount: items.length, sessionId, isLoading, fetchCart, addItem, removeItem, syncCart, clearCart }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used inside CartProvider');
    return ctx;
}
