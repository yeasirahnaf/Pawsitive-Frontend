'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
}

interface AuthContextValue {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => Promise<void>;
}

interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('paws_token');
        const storedUser = localStorage.getItem('paws_user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const persist = (u: User, t: string) => {
        setUser(u);
        setToken(t);
        localStorage.setItem('paws_token', t);
        localStorage.setItem('paws_user', JSON.stringify(u));
    };

    const clear = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('paws_token');
        localStorage.removeItem('paws_user');
    };

    const login = useCallback(async (email: string, password: string) => {
        const res = await fetch(`${API}/api/v1/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? 'Login failed');
        persist(data.user, data.token);
    }, []);

    const register = useCallback(async (payload: RegisterPayload) => {
        const res = await fetch(`${API}/api/v1/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message ?? 'Registration failed');
        persist(data.user, data.token);
    }, []);

    const logout = useCallback(async () => {
        if (token) {
            await fetch(`${API}/api/v1/logout`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            }).catch(() => { });
        }
        clear();
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
