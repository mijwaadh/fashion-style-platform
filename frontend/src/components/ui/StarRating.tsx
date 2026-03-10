'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    readonly initialScore?: number;
    readonly allowInput?: boolean;
    readonly onChange?: (val: number) => void;
    readonly size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ initialScore = 0, allowInput = false, onChange, size = 'md' }: StarRatingProps) {
    const [hoverScore, setHoverScore] = useState(0);
    const [lockedScore, setLockedScore] = useState(initialScore);

    const displayScore = allowInput && hoverScore > 0 ? hoverScore : lockedScore;

    // Lucide icons expect explicit pixel sizes, or Tailwind w/h classes
    const sizeConfig = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-6 h-6'
    };
    const iconClass = sizeConfig[size];

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!allowInput}
                    onMouseEnter={() => allowInput && setHoverScore(star)}
                    onMouseLeave={() => allowInput && setHoverScore(0)}
                    onClick={(e) => {
                        if (!allowInput) return;
                        e.stopPropagation();
                        e.preventDefault();
                        setLockedScore(star);
                        onChange?.(star);
                    }}
                    className={`transition-all ${allowInput ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                >
                    <Star
                        className={`${iconClass} transition-colors ${star <= displayScore
                                ? 'fill-amber-400 text-amber-500' // active
                                : 'fill-muted text-muted-foreground/30' // inactive
                            }`}
                    />
                </button>
            ))}
        </div>
    );
}
