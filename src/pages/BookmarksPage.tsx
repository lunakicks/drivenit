import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { supabase } from '../lib/supabase';
import type { Question } from '../types';
import { Bookmark } from 'lucide-react';

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

            // In a real app, we would fetch questions by IDs from the DB
            // For now, we might not have an endpoint to fetch multiple questions by ID easily without RLS policies allowing it
            // But let's try to fetch them from the 'questions' table
            const { data } = await supabase
                .from('questions')
                .select('*')
                .in('id', bookmarks);

            if (data) {
                setSavedQuestions(data as Question[]);
            }
            setLoading(false);
        };

        fetchBookmarks();
    }, [bookmarks]);

    if (loading) return <div className="p-6">Loading saved questions...</div>;

    return (
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
    );
};
