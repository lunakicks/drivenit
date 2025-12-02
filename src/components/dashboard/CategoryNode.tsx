import React from 'react';
import {
    Signpost,
    CircleSlash,
    Square,
    Ban,
    AlertTriangle,
    ChevronsRight,
    TrafficCone,
    Minus,
    BookOpen
} from 'lucide-react';
import clsx from 'clsx';
import type { Category } from '../../types';

interface CategoryNodeProps {
    category: Category;
    status: 'locked' | 'active' | 'completed';
    onClick: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
    'signpost': Signpost,
    'circle-slash': CircleSlash,
    'square': Square,
    'ban': Ban,
    'alert-triangle': AlertTriangle,
    'chevrons-right': ChevronsRight,
    'traffic-cone': TrafficCone,
    'minus': Minus,
    'book-open': BookOpen
};

export const CategoryNode: React.FC<CategoryNodeProps> = ({ category, status, onClick }) => {
    const IconComponent = ICON_MAP[category.icon_name || 'book-open'] || BookOpen;

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
                <IconComponent
                    size={32}
                    className={clsx(
                        status === 'locked' && "text-gray-100",
                        (status === 'active' || status === 'completed') && "text-white"
                    )}
                />
            </button>

            <span className="font-bold text-eel-grey text-sm text-center max-w-[120px]">
                {category.title_it}
            </span>
        </div>
    );
};
