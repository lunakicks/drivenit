import { create } from 'zustand';
import type { Question } from '../types';

interface QuizState {
    currentQuestionIndex: number;
    questions: Question[];
    correctAnswers: number;
    wrongAnswers: number;
    isComplete: boolean;

    // Actions
    startQuiz: (questions: Question[], startIndex?: number) => void;
    answerQuestion: (isCorrect: boolean) => void;
    nextQuestion: () => void;
    resetQuiz: () => void;
    updateQuestion: (id: string, updates: Partial<Question>) => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
    currentQuestionIndex: 0,
    questions: [],
    correctAnswers: 0,
    wrongAnswers: 0,
    isComplete: false,

    startQuiz: (questions, startIndex = 0) => {
        set({
            questions,
            currentQuestionIndex: startIndex,
            correctAnswers: 0,
            wrongAnswers: 0,
            isComplete: false,
        });
    },

    answerQuestion: (isCorrect) => {
        set((state) => ({
            correctAnswers: state.correctAnswers + (isCorrect ? 1 : 0),
            wrongAnswers: state.wrongAnswers + (isCorrect ? 0 : 1),
        }));
    },

    nextQuestion: () => {
        const { currentQuestionIndex, questions } = get();
        if (currentQuestionIndex < questions.length - 1) {
            set({ currentQuestionIndex: currentQuestionIndex + 1 });
        } else {
            set({ isComplete: true });
        }
    },

    resetQuiz: () => {
        set({
            currentQuestionIndex: 0,
            questions: [],
            correctAnswers: 0,
            wrongAnswers: 0,
            isComplete: false,
        });
    },

    updateQuestion: (id: string, updates: Partial<Question>) => {
        set((state) => ({
            questions: state.questions.map((q) =>
                q.id === id ? { ...q, ...updates } : q
            )
        }));
    },
}));
