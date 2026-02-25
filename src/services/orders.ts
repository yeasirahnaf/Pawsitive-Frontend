import { api } from '@/lib/api';

export interface OrderItem {
    id: string;
    pet: {
        id: string;
        name: string;
        species: string;
        price: number;
        thumbnail_url: string | null;
    };
    price: number;
}

export interface OrderHistory {
    id: string;
    status: string;
    notes: string | null;
    created_at: string;
}

export interface Order {
    id: string;
    order_number: string;
    status: 'pending' | 'confirmed' | 'out_for_delivery' | 'delivered' | 'cancelled';
    address_line: string;
    city: string | null;
    area: string | null;
    delivery_fee: number;
    payment_method: string;
    notes: string | null;
    items: OrderItem[];
    history: OrderHistory[];
    created_at: string;
}

export interface PlaceOrderPayload {
    address_line: string;
    city?: string;
    area?: string;
    delivery_fee: number;
    payment_method: 'cod';
    notes?: string;
}

export async function placeOrder(payload: PlaceOrderPayload, token: string, sessionId?: string) {
    return api.post<{ success: boolean; data: Order }>(
        '/api/v1/orders',
        payload,
        { token, sessionId }
    );
}

export async function getOrders(token: string) {
    return api.get<{ success: boolean; data: Order[]; meta: Record<string, number> }>(
        '/api/v1/orders',
        { token }
    );
}

export async function trackOrder(orderNumber: string, email?: string) {
    const qs = email ? `?email=${encodeURIComponent(email)}` : '';
    return api.get<{ success: boolean; data: Order }>(`/api/v1/orders/${orderNumber}${qs}`);
}
