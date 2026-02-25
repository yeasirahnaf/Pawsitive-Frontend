import { api } from '@/lib/api';

export interface CartPet {
    id: string;
    name: string;
    species: string;
    breed: string;
    price: number;
    thumbnail_url: string | null;
    status: string;
}

export interface CartItem {
    id: string;
    pet_id: string;
    pet: CartPet;
}

interface CartHeaders {
    token?: string | null;
    sessionId?: string | null;
}

export async function getCart({ token, sessionId }: CartHeaders = {}) {
    return api.get<{ success: boolean; data: CartItem[] }>('/api/v1/cart', { token, sessionId });
}

export async function addToCart(petId: string, { token, sessionId }: CartHeaders = {}) {
    return api.post<{ success: boolean; data: CartItem }>(
        '/api/v1/cart/items',
        { pet_id: petId },
        { token, sessionId }
    );
}

export async function removeFromCart(itemId: string, { token, sessionId }: CartHeaders = {}) {
    return api.del<{ success: boolean; message: string }>(
        `/api/v1/cart/items/${itemId}`,
        { token, sessionId }
    );
}

export async function syncCart(sessionId: string, token: string) {
    return api.put<{ success: boolean; data: CartItem[] }>(
        '/api/v1/cart',
        { session_id: sessionId },
        { token, sessionId }
    );
}
