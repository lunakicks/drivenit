import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthState {
    user: (User & { hearts?: number; xp?: number; streak?: number; last_study_date?: string; completed_categories?: string[] }) | null;
    bookmarks: string[]; // Array of question IDs
    flags: string[]; // Array of question IDs
    wrongAnswers: string[]; // Array of question IDs
    mistakeProgress: Record<string, number>; // question_id -> review_count
    loading: boolean;
    checkUser: () => Promise<void>;
    signOut: () => Promise<void>;
    updateHearts: (count: number) => Promise<void>;
    addXP: (amount: number) => Promise<void>;
    toggleBookmark: (questionId: string) => Promise<void>;
    toggleFlag: (questionId: string) => Promise<void>;
    recordWrongAnswer: (questionId: string) => Promise<void>;
    recordCorrectReview: (questionId: string) => Promise<void>;
    completeCategory: (categoryId: string) => Promise<void>;
    checkStreak: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    bookmarks: [],
    flags: [],
    wrongAnswers: [],
    mistakeProgress: {},
    loading: true,

    checkUser: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                // Fetch profile data
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                // Fetch bookmarks
                const { data: bookmarksData } = await supabase
                    .from('bookmarks')
                    .select('question_id')
                    .eq('user_id', session.user.id);

                // Fetch flags
                const { data: flagsData } = await supabase
                    .from('flags')
                    .select('question_id')
                    .eq('user_id', session.user.id);

                // Fetch wrong answers (user_progress with status 'incorrect')
                const { data: progressData } = await supabase
                    .from('user_progress')
                    .select('question_id, review_count')
                    .eq('user_id', session.user.id)
                    .eq('status', 'incorrect');

                // Check for daily reset
                const today = new Date().toISOString().split('T')[0];
                const lastStudyDate = profile?.last_study_date;
                let hearts = profile?.hearts ?? 5; // Default to 5 if undefined

                // If it's a new day, reset hearts to 5
                if (lastStudyDate !== today) {
                    hearts = 5;
                    // We'll update the DB with the new date and hearts
                    await supabase
                        .from('profiles')
                        .update({ hearts: 5, last_study_date: today })
                        .eq('id', session.user.id);
                }

                const mistakeProgress: Record<string, number> = {};
                progressData?.forEach(p => {
                    mistakeProgress[p.question_id] = p.review_count || 0;
                });

                set({
                    user: { ...session.user, ...profile, hearts, last_study_date: today },
                    bookmarks: bookmarksData?.map(b => b.question_id) || [],
                    flags: flagsData?.map(f => f.question_id) || [],
                    wrongAnswers: progressData?.map(p => p.question_id) || [],
                    mistakeProgress,
                    loading: false
                });
            } else {
                set({ user: null, bookmarks: [], flags: [], wrongAnswers: [], mistakeProgress: {}, loading: false });
            }

            supabase.auth.onAuthStateChange(async (_event, session) => {
                if (session?.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    const { data: bookmarksData } = await supabase
                        .from('bookmarks')
                        .select('question_id')
                        .eq('user_id', session.user.id);

                    const { data: flagsData } = await supabase
                        .from('flags')
                        .select('question_id')
                        .eq('user_id', session.user.id);

                    const { data: progressData } = await supabase
                        .from('user_progress')
                        .select('question_id, review_count')
                        .eq('user_id', session.user.id)
                        .eq('status', 'incorrect');

                    // Check for daily reset
                    const today = new Date().toISOString().split('T')[0];
                    const lastStudyDate = profile?.last_study_date;
                    let hearts = profile?.hearts ?? 5;

                    if (lastStudyDate !== today) {
                        hearts = 5;
                        await supabase
                            .from('profiles')
                            .update({ hearts: 5, last_study_date: today })
                            .eq('id', session.user.id);
                    }

                    const mistakeProgress: Record<string, number> = {};
                    progressData?.forEach(p => {
                        mistakeProgress[p.question_id] = p.review_count || 0;
                    });

                    set({
                        user: { ...session.user, ...profile, hearts, last_study_date: today },
                        bookmarks: bookmarksData?.map(b => b.question_id) || [],
                        flags: flagsData?.map(f => f.question_id) || [],
                        wrongAnswers: progressData?.map(p => p.question_id) || [],
                        mistakeProgress
                    });
                } else {
                    set({ user: null, bookmarks: [], flags: [], wrongAnswers: [], mistakeProgress: {} });
                }
            });
        } catch (error) {
            console.error('Error checking user:', error);
            set({ loading: false });
        }
    },

    signOut: async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            set({ user: null, bookmarks: [], flags: [], wrongAnswers: [], mistakeProgress: {} });
        }
    },

    updateHearts: async (count: number) => {
        const { user } = get();
        if (!user) {
            console.error('updateHearts: User not found');
            return;
        }

        const currentHearts = (user as any).hearts ?? 5;
        console.log('updateHearts: Current hearts:', currentHearts);

        // Clamp between 0 and 5
        let newHearts = currentHearts + count;
        if (newHearts > 5) newHearts = 5;
        if (newHearts < 0) newHearts = 0;

        console.log('updateHearts: New hearts:', newHearts);

        // Optimistic update
        set({ user: { ...user, hearts: newHearts } });

        // Persist to DB
        const { error } = await supabase
            .from('profiles')
            .update({ hearts: newHearts })
            .eq('id', user.id);

        if (error) {
            console.error('Error updating hearts:', error);
        } else {
            console.log('updateHearts: DB update successful');
        }
    },

    addXP: async (amount: number) => {
        const { user } = get();
        if (!user) return;

        const newXP = ((user as any).xp ?? 0) + amount;

        // Optimistic update
        set({ user: { ...user, xp: newXP } });

        // Persist to DB
        const { error } = await supabase
            .from('profiles')
            .update({ xp: newXP })
            .eq('id', user.id);

        if (error) console.error('Error updating XP:', error);
    },

    toggleBookmark: async (questionId: string) => {
        const { user, bookmarks } = get();
        if (!user) return;

        const isBookmarked = bookmarks.includes(questionId);
        const newBookmarks = isBookmarked
            ? bookmarks.filter(id => id !== questionId)
            : [...bookmarks, questionId];

        // Optimistic update
        set({ bookmarks: newBookmarks });

        if (isBookmarked) {
            // Remove from DB
            const { error } = await supabase
                .from('bookmarks')
                .delete()
                .eq('user_id', user.id)
                .eq('question_id', questionId);
            if (error) console.error('Error removing bookmark:', error);
        } else {
            // Add to DB
            const { error } = await supabase
                .from('bookmarks')
                .insert({ user_id: user.id, question_id: questionId });
            if (error) console.error('Error adding bookmark:', error);
        }
    },

    toggleFlag: async (questionId: string) => {
        const { user, flags } = get();
        if (!user) return;

        const isFlagged = flags.includes(questionId);
        const newFlags = isFlagged
            ? flags.filter(id => id !== questionId)
            : [...flags, questionId];

        // Optimistic update
        set({ flags: newFlags });

        if (isFlagged) {
            // Remove from DB
            const { error } = await supabase
                .from('flags')
                .delete()
                .eq('user_id', user.id)
                .eq('question_id', questionId);
            if (error) console.error('Error removing flag:', error);
        } else {
            // Add to DB
            const { error } = await supabase
                .from('flags')
                .insert({ user_id: user.id, question_id: questionId });
            if (error) console.error('Error adding flag:', error);
        }
    },

    recordWrongAnswer: async (questionId: string) => {
        const { user, wrongAnswers } = get();
        if (!user) return;

        if (!wrongAnswers.includes(questionId)) {
            set({ wrongAnswers: [...wrongAnswers, questionId] });

            // Persist to user_progress
            const { error } = await supabase
                .from('user_progress')
                .upsert({
                    user_id: user.id,
                    question_id: questionId,
                    status: 'incorrect',
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,question_id' });

            if (error) console.error('Error recording wrong answer:', error);
        }
    },

    recordCorrectReview: async (questionId: string) => {
        const { user, mistakeProgress, wrongAnswers } = get();
        if (!user) return;

        const currentCount = mistakeProgress[questionId] || 0;
        const newCount = currentCount + 1;

        // Update local state
        const newProgress = { ...mistakeProgress, [questionId]: newCount };
        let newWrongAnswers = wrongAnswers;

        // If reached 3 reviews, remove from wrong answers
        if (newCount >= 3) {
            newWrongAnswers = wrongAnswers.filter(id => id !== questionId);
            delete newProgress[questionId];

            // Delete from user_progress
            await supabase
                .from('user_progress')
                .delete()
                .eq('user_id', user.id)
                .eq('question_id', questionId);
        } else {
            // Update review_count in DB
            await supabase
                .from('user_progress')
                .update({ review_count: newCount, updated_at: new Date().toISOString() })
                .eq('user_id', user.id)
                .eq('question_id', questionId);
        }

        set({ mistakeProgress: newProgress, wrongAnswers: newWrongAnswers });
    },

    completeCategory: async (categoryId: string) => {
        const { user } = get();
        if (!user) return;

        const completed = (user as any).completed_categories || [];
        if (!completed.includes(categoryId)) {
            const newCompleted = [...completed, categoryId];

            // Add 2 hearts for completing a category (max 5)
            const currentHearts = (user as any).hearts ?? 5;
            const newHearts = Math.min(5, currentHearts + 2);

            // Optimistic update
            set({ user: { ...user, completed_categories: newCompleted, hearts: newHearts } });

            // Persist to DB
            const { error } = await supabase
                .from('profiles')
                .update({
                    completed_categories: newCompleted,
                    hearts: newHearts
                })
                .eq('id', user.id);

            if (error) console.error('Error completing category:', error);
        }
    },

    checkStreak: async () => {
        const { user } = get();
        if (!user) return;

        const today = new Date().toISOString().split('T')[0];
        const lastStudyDate = (user as any).last_study_date;

        if (lastStudyDate === today) return; // Already studied today

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak = (user as any).streak ?? 0;

        if (lastStudyDate === yesterdayStr) {
            newStreak += 1;
        } else {
            newStreak = 1; // Reset or start new
        }

        // Optimistic update
        set({ user: { ...user, streak: newStreak, last_study_date: today } });

        // Persist
        await supabase
            .from('profiles')
            .update({ streak: newStreak, last_study_date: today })
            .eq('id', user.id);
    }
}));
