import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';

import type { Question } from '../types';
import { Bookmark } from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';

import { supabase } from '../lib/supabase';

export const BookmarksPage: React.FC = () => {
    const { bookmarks } = useAuthStore();
    const [savedQuestions, setSavedQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookmarks = async () => {
            if (bookmarks.length === 0) {
                setSavedQuestions([]);
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('questions')
                    .select('*')
                    .in('id', bookmarks);

                if (error) throw error;

                if (data) {
                    const mappedQuestions = data.map((q: any) => ({
                        ...q,
                        options_it: typeof q.options_it === 'string' ? JSON.parse(q.options_it) : q.options_it
                    }));
                    setSavedQuestions(mappedQuestions);
                }
            } catch (error) {
                console.error('Error fetching bookmarks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookmarks();
    }, [bookmarks]);

    if (loading) return <div className="p-6">Loading saved questions...</div>;

    return (
        <PageTransition>
            <div className="p-6 pb-24">
                <h1 className="text-2xl font-bold text-eel-grey mb-6">Saved Questions</h1>

                {savedQuestions.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-hare-grey">
                            <Bookmark size={48} />
                        </div>
                        <p className="text-lg text-hare-grey font-medium">No saved questions yet.</p>
                        <p className="text-sm text-hare-grey mt-2">Bookmark tricky questions during quizzes to review them here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {savedQuestions.map((q) => (
                            <div key={q.id} className="bg-white border-2 border-card-border rounded-xl p-4">
                                <p className="font-bold text-eel-grey mb-2">{q.question_text_it}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-sm text-hare-grey font-bold uppercase">Category {q.category_id}</span>
                                    <button className="text-feather-green font-bold text-sm uppercase">Review</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </PageTransition>
    );
};
