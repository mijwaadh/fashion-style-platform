'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, Bookmark, Menu, LogOut, LayoutGrid, User, Settings, Bell, X, Compass, TrendingUp, Users, PlusCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Fetch unread notifications count
    useEffect(() => {
        if (user) {
            const fetchUnread = async () => {
                try {
                    const data = await api.get<any[]>('/api/notifications');
                    const unread = data.filter(n => !n.isRead).length;
                    setUnreadCount(unread);
                } catch (error) {
                    console.error('Failed to fetch notifications count', error);
                }
            };
            fetchUnread();

            // Poll every 60s
            const interval = setInterval(fetchUnread, 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    return (
        <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border transition-all-smooth">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="font-serif text-3xl font-bold tracking-tight text-foreground">
                            Aura.
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-8 items-center">
                        <Link href="/" className="text-secondary-foreground hover:text-accent transition-colors font-medium">Discover</Link>
                        <Link href="/" className="text-secondary-foreground hover:text-accent transition-colors font-medium">Trending</Link>
                        <Link href="/creators" className="text-secondary-foreground hover:text-accent transition-colors font-medium">Creators</Link>
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <form onSubmit={handleSearch} className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-border rounded-full bg-muted placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring text-sm transition-all-smooth"
                                placeholder="Search styles, occasions, or creators..."
                            />
                        </form>
                    </div>

                    {/* Right-side icons / auth */}
                    <div className="flex items-center space-x-4">
                        <button className="text-foreground hover:text-accent transition-colors md:hidden">
                            <Search className="h-5 w-5" />
                        </button>

                        {user ? (
                            <>
                                <Link href="/saved" className="text-foreground hover:text-accent transition-colors hidden md:block" title="Saved Looks & Boards">
                                    <Bookmark className="h-5 w-5" />
                                </Link>

                                <Link
                                    href="/looks/create"
                                    className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95 transition-all-smooth"
                                    title="Create My Look"
                                >
                                    <PlusCircle className="h-4 w-4" />
                                    <span className="hidden md:inline">Create Look</span>
                                </Link>

                                <Link href="/notifications" className="text-foreground hover:text-accent transition-colors hidden md:block relative" title="Notifications">
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Avatar + dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(o => !o)}
                                        className="flex items-center gap-2 rounded-full focus:outline-none"
                                    >
                                        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-muted border-2 border-border">
                                            {user.avatarUrl ? (
                                                <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground font-semibold text-sm">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                    </button>

                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-52 bg-background border border-border rounded-2xl shadow-lg py-2 z-50">
                                            <div className="px-4 py-3 border-b border-border">
                                                <p className="font-semibold text-foreground text-sm truncate">{user.name}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                                            </div>
                                            <Link href="/saved"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                <Bookmark className="w-4 h-4" /> My Boards
                                            </Link>
                                            {(user.role === 'seller' || user.role === 'admin') && (
                                                <Link href={user.role === 'admin' ? '/admin' : '/seller/dashboard'}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                                                    onClick={() => setDropdownOpen(false)}
                                                >
                                                    <LayoutGrid className="w-4 h-4" /> Dashboard
                                                </Link>
                                            )}
                                            <Link href="/settings"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                                                onClick={() => setDropdownOpen(false)}
                                            >
                                                <Settings className="w-4 h-4" /> Settings
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setDropdownOpen(false);
                                                    router.push('/');
                                                }}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors w-full text-left"
                                            >
                                                <LogOut className="w-4 h-4" /> Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login" className="hidden md:block text-sm font-medium text-foreground hover:text-accent transition-colors">
                                    Sign In
                                </Link>
                                <Button variant="default" size="sm" className="rounded-full px-5 hidden md:flex" asChild>
                                    <Link href="/auth/register">Join Free</Link>
                                </Button>
                                <Link href="/auth/login" className="md:hidden text-foreground hover:text-accent transition-colors">
                                    <User className="h-5 w-5" />
                                </Link>
                            </>
                        )}

                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden p-2 -mr-2 text-foreground hover:bg-muted rounded-full transition-colors"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ${mobileMenuOpen ? 'visible' : 'invisible'}`}>
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setMobileMenuOpen(false)}
                />

                {/* Drawer Content */}
                <div className={`absolute right-0 top-0 h-full w-[80%] max-w-sm bg-background shadow-2xl transition-transform duration-300 flex flex-col ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-6 flex items-center justify-between border-b border-border">
                        <span className="font-serif text-2xl font-bold">Aura.</span>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2 -mr-2 text-foreground hover:bg-muted rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto py-8 px-6 space-y-8">
                        {/* Navigation Links */}
                        <div className="space-y-4">
                            <Link
                                href="/looks/create"
                                className="flex items-center gap-4 w-full p-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg mb-6"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <PlusCircle className="w-6 h-6" /> Create My Look
                            </Link>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Explore</p>
                            <Link href="/" className="flex items-center gap-4 text-lg font-medium text-foreground hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Compass className="w-5 h-5" /></div> Discover
                            </Link>
                            <Link href="/" className="flex items-center gap-4 text-lg font-medium text-foreground hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                                <div className="p-2 bg-primary/10 rounded-lg text-primary"><TrendingUp className="w-5 h-5" /></div> Trending
                            </Link>
                            <Link href="/" className="flex items-center gap-4 text-lg font-medium text-foreground hover:text-primary transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Users className="w-5 h-5" /></div> Creators
                            </Link>
                        </div>

                        {/* Search in Mobile Menu */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Search</p>
                            <form onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false); }} className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search styles..."
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-muted border-none focus:ring-2 focus:ring-primary text-sm"
                                />
                            </form>
                        </div>
                    </div>

                    {!user && (
                        <div className="p-6 border-t border-border grid grid-cols-2 gap-4">
                            <Button variant="outline" className="rounded-xl h-12" asChild onClick={() => setMobileMenuOpen(false)}>
                                <Link href="/auth/login">Sign In</Link>
                            </Button>
                            <Button variant="default" className="rounded-xl h-12" asChild onClick={() => setMobileMenuOpen(false)}>
                                <Link href="/auth/register">Join Free</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </nav >
    );
}
