'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { clearSavedLookCache } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface AuthUser {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    storeName?: string;
    avatarUrl?: string; // legacy support
    profileImage?: string;
    bio?: string;
    likedProducts: string[];
    likedLooks: string[];
    savedProducts: string[];
    savedLooks: string[];
    token: string;
    onboardingCompleted?: boolean;
    businessType?: string;
    pickupAddress?: {
        room: string;
        street: string;
        landmark?: string;
        pincode: string;
        city: string;
        state: string;
        phone: string;
    };
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
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Rehydrate from localStorage on mount
    useEffect(() => {
        const rehydrate = async () => {
            try {
                const stored = sessionStorage.getItem('aura_user');
                if (stored) {
                    const parsedUser = JSON.parse(stored);
                    setUser(parsedUser);
                    // Sync with server immediately to get latest role/data
                    if (parsedUser.token) {
                        setLoading(true);
                        await validateToken(parsedUser.token);
                    }
                }
            } catch {
                sessionStorage.removeItem('aura_user');
            } finally {
                setLoading(false);
            }
        };
        rehydrate();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
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
        sessionStorage.setItem('aura_user', JSON.stringify(data));
        setUser(data);
        return data;
    }, []);

    const register = useCallback(async (name: string, email: string, password: string, role: string, storeName?: string) => {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role, storeName }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');

        // Registration now returns the user and token directly
        sessionStorage.setItem('aura_user', JSON.stringify(data));
        setUser(data);
        return data;
    }, []);

    const verifyOtp = useCallback(async (email: string, otp: string) => {
        const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Verification failed');

        // On success, we get the token, act like a login
        sessionStorage.setItem('aura_user', JSON.stringify(data));
        setUser(data);
    }, []);

    const resendOtp = useCallback(async (email: string) => {
        const res = await fetch(`${API_URL}/api/auth/resend-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to resend code');
    }, []);

    const updateUser = useCallback((userData: Partial<AuthUser>) => {
        if (!user) return;
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        sessionStorage.setItem('aura_user', JSON.stringify(updatedUser));
    }, [user]);

    const logout = useCallback(() => {
        sessionStorage.removeItem('aura_user');
        clearSavedLookCache();
        setUser(null);
    }, []);

    const validateToken = useCallback(async (manualToken?: string): Promise<boolean> => {
        try {
            const tokenToUse = manualToken || user?.token;
            if (!tokenToUse) return false;

            const res = await fetch(`${API_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${tokenToUse}`,
                },
            });
            if (res.ok) {
                const userData = await res.json();
                // Preserve the existing token when updating user data
                const updatedUser = { ...userData, token: tokenToUse };
                setUser(updatedUser);
                sessionStorage.setItem('aura_user', JSON.stringify(updatedUser));
                return true;
            } else if (res.status === 401) {
                // Token is dead, clear everything to stop the 401 loop
                logout();
                return false;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Token validation failed:', error);
            return false;
        }
    }, [user?.token, logout]);

    const forgotPassword = useCallback(async (email: string) => {
        const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to send reset link');
    }, []);

    const resetPassword = useCallback(async (token: string, password: string) => {
        const res = await fetch(`${API_URL}/api/auth/reset-password/${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to reset password');
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, login, register, verifyOtp, resendOtp, logout, updateUser, validateToken, forgotPassword, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
