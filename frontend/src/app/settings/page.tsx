'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Loader2, Save } from 'lucide-react';
import Image from 'next/image';

export default function SettingsPage() {
    const { user, login } = useAuth(); // We destructure login to refresh user state

    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [storeName, setStoreName] = useState('');
    const [profileImage, setProfileImage] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Populate initial state from context
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setBio(user.bio || '');
            setStoreName(user.storeName || '');
            setProfileImage(user.avatarUrl || user.profileImage || ''); // context might map it to avatarUrl
        }
    }, [user]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setMessage({ text: '', type: '' });

        const formData = new FormData();
        formData.append('image', file);

        try {
            // Because our api utility mostly sends JSON, we send this fetch directly or adjust headers
            const token = localStorage.getItem('aura_token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/upload/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) throw new Error("Image upload failed");
            const data = await res.json();
            setProfileImage(data.url);
            setMessage({ text: 'Avatar uploaded successfully! Click save to apply.', type: 'success' });
        } catch (error) {
            console.error(error);
            setMessage({ text: 'Failed to upload avatar. Try a smaller image.', type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        setMessage({ text: '', type: '' });

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = await api.put<any>('/api/users/me', {
                name,
                bio,
                storeName,
                profileImage
            });

            // The API returns the updated user object. Let's refresh our AuthContext token/state by re-fetching /me.
            // A dirty trick since we don't have a direct `updateUser` context function, we can just reload or trigger a fetch.
            // As a quick UX win:
            setMessage({ text: 'Profile updated successfully!', type: 'success' });

            // Force a reload to let AuthContext pick up the fresh `/api/users/me` data globally
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error(error);
            setMessage({ text: 'Failed to update profile.', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            <Navbar />

            <main className="max-w-3xl mx-auto px-4 mt-8 md:mt-12">
                <div className="bg-background rounded-3xl border border-border shadow-sm overflow-hidden p-6 md:p-10">
                    <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Account Settings</h1>
                    <p className="text-muted-foreground mb-8">Update your profile identity and public information.</p>

                    {message.text && (
                        <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSave} className="space-y-8">

                        {/* Avatar Upload Section */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-8 border-b border-border">
                            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted border-4 border-background shadow-md shrink-0 group">
                                {profileImage ? (
                                    <Image src={profileImage} alt="Avatar" fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-secondary text-secondary-foreground text-4xl font-bold">
                                        {name.charAt(0) || 'U'}
                                    </div>
                                )}

                                {/* Hover overlay */}
                                <div
                                    className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <Camera className="w-6 h-6 text-white" />}
                                    <span className="text-white text-xs font-semibold mt-1">Change</span>
                                </div>
                            </div>

                            <div className="text-center sm:text-left pt-2">
                                <h3 className="font-semibold text-foreground text-lg">Profile Picture</h3>
                                <p className="text-sm text-muted-foreground mb-4">JPG, GIF or PNG. 1MB max.</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                >
                                    {isUploading ? 'Uploading...' : 'Upload Image'}
                                </Button>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                />
                            </div>
                        </div>

                        {/* Text Inputs */}
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Display Name</label>
                                <Input
                                    type="text"
                                    value={name}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                    placeholder="Your full name"
                                    required
                                    className="max-w-md"
                                />
                            </div>

                            {user.role === 'seller' && (
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1.5">Store / Brand Name</label>
                                    <Input
                                        type="text"
                                        value={storeName}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStoreName(e.target.value)}
                                        placeholder="e.g. Vintage Vault"
                                        className="max-w-md"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1.5">Bio</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell the community a bit about your style..."
                                    className="w-full h-32 px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none placeholder:text-muted-foreground/60 transition-all"
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end pt-4 border-t border-border">
                            <Button type="submit" size="lg" disabled={isSaving || isUploading} className="min-w-[140px] rounded-full">
                                {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                            </Button>
                        </div>

                    </form>
                </div>
            </main>
        </div>
    );
}
