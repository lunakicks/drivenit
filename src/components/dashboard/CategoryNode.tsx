import React from 'react';
import { Check, Star, Lock } from 'lucide-react';
import clsx from 'clsx';
import type { Category } from '../../types';

interface CategoryNodeProps {
    category: Category;
    status: 'locked' | 'active' | 'completed';
    onClick: () => void;
}

export const CategoryNode: React.FC<CategoryNodeProps> = ({ category, status, onClick }) => {
    return (
        <div className="flex flex-col items-center gap-2 relative z-10">
            <button
                onClick={onClick}
                disabled={status === 'locked'}
                className={clsx(
                    "w-20 h-20 rounded-full flex items-center justify-center border-b-4 transition-all active:border-b-0 active:translate-y-[4px]",
                    status === 'locked' && "bg-hare-grey border-gray-400 cursor-not-allowed",
                    status === 'active' && "bg-feather-green border-feather-green-dark shadow-lg",
                    status === 'completed' && "bg-mustard-yellow border-mustard-yellow-dark"
                )}
            >
                {status === 'locked' && <Lock className="text-white" size={32} />}
                {status === 'active' && <Star className="text-white fill-white" size={32} />}
                {status === 'completed' && <Check className="text-white" size={32} strokeWidth={4} />}
            </button>

            <span className="font-bold text-eel-grey text-sm text-center max-w-[120px]">
                {category.title_it}
            </span>
        </div>
    );
};
