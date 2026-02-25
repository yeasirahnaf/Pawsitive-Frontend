import { api } from '@/lib/api';

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    role: string;
}

export interface AuthResponse {
    success: boolean;
    user: AuthUser;
    token: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
}

export async function loginUser(email: string, password: string) {
    return api.post<AuthResponse>('/api/v1/login', { email, password });
}

export async function registerUser(payload: RegisterPayload) {
    return api.post<AuthResponse>('/api/v1/register', payload);
}

export async function logoutUser(token: string) {
    return api.post<{ success: boolean; message: string }>('/api/v1/logout', {}, { token });
}

export async function getProfile(token: string) {
    return api.get<{ success: boolean; data: { user: AuthUser } }>('/api/v1/profile', { token });
}
