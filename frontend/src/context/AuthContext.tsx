'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { clearSavedLookCache } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface AuthUser {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'seller' | 'admin';
    storeName?: string;
    avatarUrl?: string; // legacy support
    profileImage?: string;
    bio?: string;
    likedProducts: string[];
    likedLooks: string[];
    savedProducts: string[];
    token: string;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    login: (email: string, password: string) => Promise<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    register: (name: string, email: string, password: string, role: string, storeName?: string) => Promise<any>;
    verifyOtp: (email: string, otp: string) => Promise<void>;
    resendOtp: (email: string) => Promise<void>;
    logout: () => void;
    updateUser: (userData: Partial<AuthUser>) => void;
    validateToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Rehydrate from localStorage on mount
    useEffect(() => {
        const rehydrate = async () => {
            try {
                const stored = localStorage.getItem('aura_user');
                if (stored) {
                    const parsedUser = JSON.parse(stored);
                    setUser(parsedUser);
                    // Sync with server immediately to get latest role/data
                    setLoading(true);
                    await validateToken();
                }
            } catch {
                localStorage.removeItem('aura_user');
            } finally {
                setLoading(false);
            }
        };
        rehydrate();
    }, []);

    const login = async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        // 403 Forbidden is what we return if unverified
        if (res.status === 403 && data.requiresVerification) {
            return data;
        }

        if (!res.ok) throw new Error(data.message || 'Login failed');
        localStorage.setItem('aura_user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const register = async (name: string, email: string, password: string, role: string, storeName?: string) => {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role, storeName }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');

        // Registration now returns requiresVerification instead of logging them in
        return data;
    };

    const verifyOtp = async (email: string, otp: string) => {
        const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Verification failed');

        // On success, we get the token, act like a login
        localStorage.setItem('aura_user', JSON.stringify(data));
        setUser(data);
    };

    const resendOtp = async (email: string) => {
        const res = await fetch(`${API_URL}/api/auth/resend-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to resend code');
    };

    const updateUser = (userData: Partial<AuthUser>) => {
        if (!user) return;
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('aura_user', JSON.stringify(updatedUser));
    };

    const validateToken = async (): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                },
            });
            if (res.ok) {
                const userData = await res.json();
                // Preserve the existing token when updating user data
                const updatedUser = { ...userData, token: user?.token };
                setUser(updatedUser);
                localStorage.setItem('aura_user', JSON.stringify(updatedUser));
                return true;
            } else {
                // Token is invalid, but don't logout automatically
                return false;
            }
        } catch (error) {
            console.error('Token validation failed:', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('aura_user');
        clearSavedLookCache();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, verifyOtp, resendOtp, logout, updateUser, validateToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
