import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export interface AuthState {
    user: (User & { hearts?: number; xp?: number; streak?: number; last_study_date?: string }) | null;
    bookmarks: string[]; // Array of question IDs
    flags: string[]; // Array of question IDs
    wrongAnswers: string[]; // Array of question IDs
    loading: boolean;
    checkUser: () => Promise<void>;
    signOut: () => Promise<void>;
    updateHearts: (count: number) => Promise<void>;
    addXP: (amount: number) => Promise<void>;
    toggleBookmark: (questionId: string) => Promise<void>;
    toggleFlag: (questionId: string) => Promise<void>;
    recordWrongAnswer: (questionId: string) => Promise<void>;
    checkStreak: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    bookmarks: [],
    flags: [],
    wrongAnswers: [],
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
                    .select('question_id')
                    .eq('user_id', session.user.id)
                    .eq('status', 'incorrect');

                set({
                    user: { ...session.user, ...profile },
                    bookmarks: bookmarksData?.map(b => b.question_id) || [],
                    flags: flagsData?.map(f => f.question_id) || [],
                    wrongAnswers: progressData?.map(p => p.question_id) || [],
                    loading: false
                });
            } else {
                set({ user: null, bookmarks: [], flags: [], wrongAnswers: [], loading: false });
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
                        .select('question_id')
                        .eq('user_id', session.user.id)
                        .eq('status', 'incorrect');

                    set({
                        user: { ...session.user, ...profile },
                        bookmarks: bookmarksData?.map(b => b.question_id) || [],
                        flags: flagsData?.map(f => f.question_id) || [],
                        wrongAnswers: progressData?.map(p => p.question_id) || []
                    });
                } else {
                    set({ user: null, bookmarks: [], flags: [], wrongAnswers: [] });
                }
            });
        } catch (error) {
            console.error('Error checking user:', error);
            set({ loading: false });
        }
    },

    signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, bookmarks: [], flags: [], wrongAnswers: [] });
    },

    updateHearts: async (count: number) => {
        const { user } = get();
        if (!user) return;

        const newHearts = Math.max(0, ((user as any).hearts ?? 5) + count);

        // Optimistic update
        set({ user: { ...user, hearts: newHearts } });

        // Persist to DB
        const { error } = await supabase
            .from('profiles')
            .update({ hearts: newHearts })
            .eq('id', user.id);

        if (error) console.error('Error updating hearts:', error);
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
