import React, { useEffect, useState } from 'react';
import { CategoryNode } from '../components/dashboard/CategoryNode';
import { PageTransition } from '../components/layout/PageTransition';
import type { Category } from '../types';
import { useNavigate } from 'react-router-dom';
import { Zap, Heart, Languages } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { supabase } from '../lib/supabase';
import { Logo } from '../components/common/Logo';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const completedCategories = (user as any)?.completed_categories || [];
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [translated, setTranslated] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .order('order_index', { ascending: true })
                    .order('created_at', { ascending: true });

                if (error) throw error;
                setCategories(data || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryClick = (categoryId: string) => {
        navigate(`/quiz/${categoryId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <Logo size="lg" variant="icon" className="animate-pulse" />
                <p className="text-feather-green font-bold text-xl">Loading...</p>
            </div>
        );
    }

    return (
        <PageTransition>
            <div className="flex flex-col min-h-full">
                {/* Top Bar */}
                <header className="sticky top-0 bg-white/90 backdrop-blur-sm border-b-2 border-card-border p-4 flex justify-between items-center z-20">
                    <div className="flex items-center gap-2">
                        <Logo size="sm" variant="icon" />
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setTranslated(!translated)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title={translated ? "Show Italian" : "Show English"}
                        >
                            <Languages
                                size={24}
                                className={translated ? "text-feather-green" : "text-hare-grey"}
                            />
                        </button>
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
                    {categories.map((category, index) => {
                        const isCompleted = completedCategories.includes(category.id);

                        // First category is always active if not completed
                        // Subsequent categories are active if the previous one is completed
                        const isPreviousCompleted = index === 0 || completedCategories.includes(categories[index - 1].id);

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
                                    translated={translated}
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
        </PageTransition>
    );
};
