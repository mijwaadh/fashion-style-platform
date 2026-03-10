'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import AdminGuard from '@/components/layout/AdminGuard';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    Users, Loader2, ChevronLeft, Search,
    Trash2, ShieldCheck, Shield, User as UserIcon, AlertCircle
} from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface AdminUser {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'seller' | 'admin';
    profileImage?: string;
    isVerified: boolean;
    createdAt: string;
    followers?: string[];
}

interface UsersResponse {
    users: AdminUser[];
    total: number;
    page: number;
    pages: number;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    admin: { label: 'Admin', color: 'bg-red-100 text-red-700 border-red-200', icon: ShieldCheck },
    seller: { label: 'Seller', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Shield },
    user: { label: 'User', color: 'bg-muted text-muted-foreground border-border', icon: UserIcon },
};

function RoleBadge({ role }: { role: string }) {
    const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.user;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
            <cfg.icon className="w-3 h-3" />
            {cfg.label}
        </span>
    );
}

function UsersContent() {
    const [data, setData] = useState<UsersResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [error, setError] = useState('');

    // Confirm Modal State
    const [confirmDelete, setConfirmDelete] = useState<{ id: string, name: string } | null>(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ page: String(page), limit: '15' });
            if (search) params.set('search', search);
            if (roleFilter) params.set('role', roleFilter);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res = await api.get<any>(`/api/admin/users?${params.toString()}`);
            setData(res);
        } catch (err) {
            console.error(err);
            setError('Failed to load users.');
        } finally {
            setIsLoading(false);
        }
    }, [page, search, roleFilter]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        setProcessingId(userId);
        try {
            await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
            setData(prev => prev ? {
                ...prev,
                users: prev.users.map(u => u._id === userId ? { ...u, role: newRole as AdminUser['role'] } : u)
            } : null);
        } catch (err) {
            console.error(err);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDeleteClick = (userId: string, userName: string) => {
        setConfirmDelete({ id: userId, name: userName });
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        const userId = confirmDelete.id;
        setProcessingId(userId);
        setConfirmDelete(null);
        try {
            await api.delete(`/api/admin/users/${userId}`);
            setData(prev => prev ? { ...prev, users: prev.users.filter(u => u._id !== userId), total: prev.total - 1 } : null);
        } catch (err) {
            console.error(err);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 mt-8 md:mt-12">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href="/admin"><ChevronLeft className="w-5 h-5" /></Link>
                    </Button>
                    <div>
                        <div className="text-sm text-muted-foreground mb-0.5">
                            <Link href="/admin" className="text-primary font-medium hover:underline">Admin</Link>
                            <span className="mx-1">›</span> Users
                        </div>
                        <h1 className="font-serif text-3xl font-bold text-foreground flex items-center gap-2">
                            <Users className="w-7 h-7 text-primary" /> User Management
                        </h1>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
                        className="px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-medium"
                    >
                        <option value="">All Roles</option>
                        <option value="user">Users</option>
                        <option value="seller">Sellers</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>

                {error && (
                    <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 mb-4">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Table */}
                <div className="bg-background rounded-2xl border border-border shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="flex justify-center py-24">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left whitespace-nowrap">
                                    <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold">
                                        <tr>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {data?.users.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-16 text-center text-muted-foreground">
                                                    No users found.
                                                </td>
                                            </tr>
                                        ) : data?.users.map(u => (
                                            <tr key={u._id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 overflow-hidden font-bold text-sm text-foreground">
                                                            {u.profileImage
                                                                ? <img src={u.profileImage} alt={u.name} className="w-full h-full object-cover" />
                                                                : u.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-foreground">{u.name}</p>
                                                            <p className="text-xs text-muted-foreground">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={u.role}
                                                        disabled={processingId === u._id}
                                                        onChange={e => handleRoleChange(u._id, e.target.value)}
                                                        className="px-3 py-1.5 rounded-lg border border-border bg-background text-xs font-medium focus:ring-2 focus:ring-primary disabled:opacity-50 cursor-pointer"
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="seller">Seller</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${u.isVerified ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                                        {u.isVerified ? '✓ Verified' : '⏳ Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {processingId === u._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin inline-block text-muted-foreground" />
                                                    ) : (
                                                        <button
                                                            onClick={() => handleDeleteClick(u._id, u.name)}
                                                            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                            title="Delete user"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {data && data.pages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {data.users.length} of {data.total} users
                                    </p>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                                            Prev
                                        </Button>
                                        <span className="flex items-center text-sm font-medium px-3">
                                            {page} / {data.pages}
                                        </span>
                                        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setPage(p => p + 1)} disabled={page >= data.pages}>
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Deletion Confirmation */}
            <ConfirmModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDelete}
                title="Delete User?"
                message={`Are you sure you want to permanently delete "${confirmDelete?.name}" and all their content? This cannot be undone.`}
                confirmText="Yes, Delete"
                cancelText="Keep User"
                variant="danger"
            />
        </div>
    );
}

export default function AdminUsersPage() {
    return (
        <AdminGuard>
            <UsersContent />
        </AdminGuard>
    );
}
