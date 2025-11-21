import React from 'react';
import { CategoryNode } from '../components/dashboard/CategoryNode';
import type { Category } from '../types';
import { useNavigate } from 'react-router-dom';
import { Zap, Heart } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';

// Mock Data
const MOCK_CATEGORIES: Category[] = [
    { id: '1', slug: 'road-signs', title_it: 'Segnali Stradali', order_index: 0, icon_name: 'signpost' },
    { id: '2', slug: 'right-of-way', title_it: 'Precedenza', order_index: 1, icon_name: 'arrow-right' },
    { id: '3', slug: 'speed-limits', title_it: 'Limiti di Velocità', order_index: 2, icon_name: 'gauge' },
    { id: '4', slug: 'parking', title_it: 'Sosta e Fermata', order_index: 3, icon_name: 'parking' },
];

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const completedCategories = (user as any)?.completed_categories || [];

    const handleCategoryClick = (categoryId: string) => {
        navigate(`/quiz/${categoryId}`);
    };

    return (
        <div className="flex flex-col min-h-full">
            {/* Top Bar */}
            <header className="sticky top-0 bg-white/90 backdrop-blur-sm border-b-2 border-card-border p-4 flex justify-between items-center z-20">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-6 bg-flag-italy rounded-sm border border-card-border" title="Learning Italian"></div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-wrong-red font-bold">
                        <Heart className="fill-current" size={24} />
                        <span>{(user as any)?.hearts ?? 5}</span>
                    </div>
                    <div className="flex items-center gap-1 text-mustard-yellow font-bold">
                        <Zap className="fill-current" size={24} />
                        <span>{(user as any)?.xp ?? 0}</span>
                    </div>
                </div>
            </header>

            {/* Map Path */}
            <div className="flex-1 py-8 px-4 flex flex-col items-center gap-8">
                {MOCK_CATEGORIES.map((category, index) => {
                    const isCompleted = completedCategories.includes(category.id);

                    // First category is always active if not completed
                    // Subsequent categories are active if the previous one is completed
                    const isPreviousCompleted = index === 0 || completedCategories.includes(MOCK_CATEGORIES[index - 1].id);

                    let status: 'locked' | 'active' | 'completed' = 'locked';
                    if (isCompleted) {
                        status = 'completed';
                    } else if (isPreviousCompleted) {
                        status = 'active';
                    }

                    return (
                        <div
                            key={category.id}
                            className="relative"
                            style={{
                                marginLeft: index % 2 === 0 ? '0px' : '60px', // Zig-zag effect
                                marginRight: index % 2 !== 0 ? '0px' : '60px'
                            }}
                        >
                            <CategoryNode
                                category={category}
                                status={status}
                                onClick={() => {
                                    if (status !== 'locked') {
                                        handleCategoryClick(category.id);
                                    }
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
