import { api } from '@/lib/api';

export interface PetImage {
    id: string;
    url: string;
    is_thumbnail: boolean;
}

export interface Pet {
    id: string;
    name: string;
    species: string;
    breed: string;
    age_months: number;
    gender: 'male' | 'female';
    size: 'small' | 'medium' | 'large' | 'extra_large';
    color: string;
    price: number;
    status: 'available' | 'reserved' | 'sold';
    description: string;
    health_records: string;
    location_name: string;
    latitude: number;
    longitude: number;
    behaviours: string[];
    images: PetImage[];
    thumbnail_url: string | null;
    created_at: string;
}

export interface PetMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface PetListParams {
    search?: string;
    species?: string;
    breed?: string;
    gender?: string;
    size?: string;
    color?: string;
    min_price?: number;
    max_price?: number;
    min_age?: number;
    max_age?: number;
    behaviour?: string;
    lat?: number;
    lng?: number;
    radius_km?: number;
    sort_by?: 'price' | 'age_months' | 'created_at';
    sort_dir?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
}

export async function getPets(params: PetListParams = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.set(k, String(v));
    });
    const qs = query.toString();
    return api.get<{ success: boolean; data: Pet[]; meta: PetMeta }>(
        `/api/v1/pets${qs ? `?${qs}` : ''}`
    );
}

export async function getPet(id: string) {
    return api.get<{ success: boolean; data: Pet }>(`/api/v1/pets/${id}`);
}
