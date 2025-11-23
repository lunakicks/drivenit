import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizStore } from '../stores/useQuizStore';
import { useAuthStore } from '../stores/useAuthStore';
import { supabase } from '../lib/supabase';
import { QuizHeader } from '../components/quiz/QuizHeader';
import { FlashCard } from '../components/quiz/FlashCard';
import { ExplanationView } from '../components/quiz/ExplanationView';
import { CompletionModal } from '../components/quiz/CompletionModal';
import { PageTransition } from '../components/layout/PageTransition';

import clsx from 'clsx';



export const QuizPage: React.FC = () => {
    const { categoryId, mode } = useParams();
    const navigate = useNavigate();
    const {
        questions,
        currentQuestionIndex,
        startQuiz,
        answerQuestion,
        nextQuestion,
        isComplete,
        correctAnswers
    } = useQuizStore();

    const { user, bookmarks, flags, updateHearts, addXP, toggleBookmark, toggleFlag, checkStreak, recordWrongAnswer, wrongAnswers } = useAuthStore();

    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isChecked, setIsChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    // Translation State
    const [translated, setTranslated] = useState(false);
    const [translation, setTranslation] = useState<{ q: string, explanation: string, opts: string[] } | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            let query = supabase.from('questions').select('*');

            if (categoryId) {
                query = query.eq('category_id', categoryId);
            } else if (mode === 'mistakes') {
                if (wrongAnswers.length === 0) {
                    // Handle empty state or redirect
                    return;
                }
                query = query.in('id', wrongAnswers);
            } else if (mode === 'bookmarks') {
                if (bookmarks.length === 0) {
                    return;
                }
                query = query.in('id', bookmarks);
            } else if (mode === 'test') {
                // Use RPC to get random questions
                try {
                    const { data, error } = await supabase.rpc('get_random_questions', { limit_count: 30 });
                    if (error) throw error;

                    if (data) {
                        const mappedQuestions = data.map((q: any) => ({
                            ...q,
                            options_it: typeof q.options_it === 'string' ? JSON.parse(q.options_it) : q.options_it
                        }));
                        startQuiz(mappedQuestions);
                    }
                    return; // Exit early as we handled data fetching
                } catch (error) {
                    console.error('Error fetching random questions:', error);
                    return;
                }
            } else {
                return; // Invalid state
            }

            try {
                const { data, error } = await query;

                if (error) throw error;

                if (data) {
                    const mappedQuestions = data.map((q: any) => ({
                        ...q,
                        options_it: typeof q.options_it === 'string' ? JSON.parse(q.options_it) : q.options_it
                    }));

                    // Check for startId in URL query params
                    const searchParams = new URLSearchParams(window.location.search);
                    const startId = searchParams.get('startId');
                    let startIndex = 0;

                    if (startId) {
                        const foundIndex = mappedQuestions.findIndex((q: any) => q.id === startId);
                        if (foundIndex !== -1) startIndex = foundIndex;
                    }

                    startQuiz(mappedQuestions, startIndex);
                }
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        };

        fetchQuestions();
    }, [categoryId, mode, startQuiz, wrongAnswers, bookmarks]);

    useEffect(() => {
        if (isComplete) {
            if (categoryId) {
                // Mark category as complete
                useAuthStore.getState().completeCategory(categoryId);
            }
            setShowCompletionModal(true);
        }
    }, [isComplete, categoryId]);

    // Determine modal content based on mode
    let modalTitle = "Section Complete!";
    let modalMessage = "You've mastered this section.";

    if (mode === 'mistakes') {
        modalTitle = "Review Complete!";
        modalMessage = "You've reviewed your mistakes.";
    } else if (mode === 'bookmarks') {
        modalTitle = "Saved Questions Reviewed!";
        modalMessage = "Great job reviewing your saved questions.";
    } else if (mode === 'test') {
        modalTitle = "Test Completed!";
        modalMessage = "You've finished the simulation.";
    }

    // Reset translation when question changes
    useEffect(() => {
        setTranslated(false);
        setTranslation(null);
    }, [currentQuestionIndex]);

    const currentQuestion = questions[currentQuestionIndex];

    // Pre-fetch translation and explanation when question loads
    useEffect(() => {
        if (!currentQuestion) return;

        const preFetchData = async () => {
            // 1. Check/Generate Italian Explanation if missing
            if (!currentQuestion.explanation_it) {
                console.log('Pre-fetching explanation for:', currentQuestion.id);
                try {
                    const { data, error } = await supabase.functions.invoke('generate-explanation', {
                        body: { question_id: currentQuestion.id, target_lang: 'it' }
                    });

                    if (error) {
                        console.error('Edge Function Error:', error);
                    } else if (data?.explanation) {
                        // Use store action to update state and trigger re-render
                        useQuizStore.getState().updateQuestion(currentQuestion.id, { explanation_it: data.explanation });
                    }
                } catch (err: any) {
                    console.error('Failed to pre-fetch explanation:', err);
                    if (err.message?.includes('401')) {
                        console.error('⚠️ 401 Unauthorized: This usually means the VITE_SUPABASE_ANON_KEY is missing or invalid.');
                    }
                }
            }

            // 2. Pre-fetch Translation (English)
            // We don't set 'translated' to true, we just cache the data so it's ready
            if (!translation) {
                console.log('Pre-fetching translation for:', currentQuestion.id);
                // Import translateQuestion dynamically if needed, or assume it's available
                // We need to import it at the top of the file.
                // For now, I'll use the imported function.
                import('../lib/translation').then(async ({ translateQuestion }) => {
                    const result = await translateQuestion(currentQuestion.id, 'en');
                    if (result) {
                        setTranslation({ q: result.question_text, explanation: result.explanation, opts: result.options });
                    }
                });
            }
        };

        preFetchData();
    }, [currentQuestion, translation]);

    if (!currentQuestion) return <div className="p-4">Loading...</div>;

    const handleCheck = async () => {
        if (selectedOption === null) return;

        const correct = selectedOption === currentQuestion.correct_option_index;
        setIsCorrect(correct);
        setIsChecked(true);
        answerQuestion(correct);

        if (correct) {
            addXP(10);
            checkStreak();
        } else {
            updateHearts(-1);
            recordWrongAnswer(currentQuestion.id);
        }
    };

    const handleContinue = () => {
        setSelectedOption(null);
        setIsChecked(false);
        setIsCorrect(null);
        nextQuestion();
    };

    const progress = ((currentQuestionIndex) / questions.length) * 100;
    const hearts = (user as any)?.hearts ?? 5;

    const isBookmarked = bookmarks.includes(currentQuestion.id);
    const isFlagged = flags.includes(currentQuestion.id);

    return (
        <PageTransition>
            <div className="min-h-screen bg-swan-white flex flex-col relative">
                <QuizHeader progress={progress} hearts={hearts} />

                <FlashCard
                    question={currentQuestion}
                    selectedOptionIndex={selectedOption}
                    onOptionSelect={setSelectedOption}
                    isChecked={isChecked}
                    onBookmark={() => user && toggleBookmark(currentQuestion.id)}
                    onFlag={() => user && toggleFlag(currentQuestion.id)}
                    isBookmarked={isBookmarked}
                    isFlagged={isFlagged}
                    translated={translated}
                    setTranslated={setTranslated}
                    translation={translation}
                    setTranslation={setTranslation}
                    disableTranslation={mode === 'test'}
                />

                {/* Bottom Action Bar (Before Checking) */}
                {!isChecked && (
                    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t-2 border-card-border p-4 bg-white">
                        <button
                            onClick={handleCheck}
                            disabled={selectedOption === null}
                            className={clsx(
                                "w-full py-3 rounded-xl font-extrabold text-white uppercase tracking-widest shadow-btn transition-transform active:translate-y-[4px] active:shadow-none",
                                selectedOption !== null ? "bg-feather-green hover:bg-feather-green-dark" : "bg-hare-grey cursor-not-allowed"
                            )}
                        >
                            Check
                        </button>
                    </div>
                )}

                {/* Explanation View (After Checking) */}
                {isChecked && isCorrect !== null && (
                    (() => {
                        const explanationText = (translated && translation?.explanation)
                            ? translation.explanation
                            : (currentQuestion.explanation_it || "Loading explanation...");

                        return (
                            <ExplanationView
                                isCorrect={isCorrect}
                                explanation={explanationText}
                                onContinue={handleContinue}
                            />
                        );
                    })()
                )}
            </div>

            {showCompletionModal && (
                <CompletionModal
                    xpEarned={correctAnswers * 10}
                    correctAnswers={correctAnswers}
                    totalQuestions={questions.length}
                    onHome={() => navigate('/')}
                    title={modalTitle}
                    message={modalMessage}
                />
            )}
        </PageTransition>
    );
};
