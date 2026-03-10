'use client';

import React, { useEffect } from 'react';
import { X, AlertTriangle, AlertCircle, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    isLoading = false
}: ConfirmModalProps) {

    // Accessibility: prevent scrolling when open & handle Escape key
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            const handleEsc = (e: KeyboardEvent) => {
                if (e.key === 'Escape') onClose();
            };
            window.addEventListener('keydown', handleEsc);
            return () => {
                document.body.style.overflow = 'unset';
                window.removeEventListener('keydown', handleEsc);
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: <Trash2 className="w-6 h-6 text-red-600" />,
            bg: 'bg-red-50',
            button: 'bg-red-600 hover:bg-red-700 text-white'
        },
        warning: {
            icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
            bg: 'bg-amber-50',
            button: 'bg-amber-600 hover:bg-amber-700 text-white'
        },
        info: {
            icon: <Info className="w-6 h-6 text-blue-600" />,
            bg: 'bg-blue-50',
            button: 'bg-blue-600 hover:bg-blue-700 text-white'
        }
    };

    const style = variantStyles[variant];

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-background w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-border animate-in zoom-in duration-200 flex flex-col"
                onClick={e => e.stopPropagation()}
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                aria-describedby="modal-message"
            >
                {/* Header/Banner */}
                <div className={`p-6 flex items-center justify-center ${style.bg} border-b border-border/50`}>
                    <div className="p-3 bg-background rounded-2xl shadow-sm border border-border/10">
                        {style.icon}
                    </div>
                </div>

                <div className="p-8 text-center space-y-3">
                    <h2 id="modal-title" className="text-2xl font-bold text-foreground font-serif leading-tight">
                        {title}
                    </h2>
                    <p id="modal-message" className="text-muted-foreground text-sm leading-relaxed max-w-[280px] mx-auto">
                        {message}
                    </p>
                </div>

                {/* Footer Actions */}
                <div className="px-8 pb-8 flex flex-col gap-3">
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`w-full h-12 rounded-2xl font-bold text-base shadow-lg transition-all active:scale-[0.98] ${style.button}`}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 animate-spin" />
                                Processing...
                            </span>
                        ) : confirmText}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-full h-12 rounded-2xl font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
                    >
                        {cancelText}
                    </Button>
                </div>

                {/* Quick close button for mouse users */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-muted/30 rounded-full transition-colors group"
                >
                    <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                </button>
            </div>
        </div>
    );
}
