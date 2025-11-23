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
    const { categoryId } = useParams();
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

    const { user, bookmarks, flags, updateHearts, addXP, toggleBookmark, toggleFlag, checkStreak, recordWrongAnswer } = useAuthStore();

    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isChecked, setIsChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showCompletionModal, setShowCompletionModal] = useState(false);

    // Translation State
    const [translated, setTranslated] = useState(false);
    const [translation, setTranslation] = useState<{ q: string, explanation: string, opts: string[] } | null>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            if (!categoryId) return;

            try {
                const { data, error } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('category_id', categoryId);

                if (error) throw error;

                if (data) {
                    // Map DB questions to frontend Question type if needed
                    // Currently the schema matches well, but we might need to parse options if they are JSON
                    const mappedQuestions = data.map((q: any) => ({
                        ...q,
                        options_it: typeof q.options_it === 'string' ? JSON.parse(q.options_it) : q.options_it
                    }));
                    startQuiz(mappedQuestions);
                }
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        };

        fetchQuestions();
    }, [categoryId, startQuiz]);

    useEffect(() => {
        if (isComplete && categoryId) {
            // Mark category as complete
            useAuthStore.getState().completeCategory(categoryId);
            setShowCompletionModal(true);
        }
    }, [isComplete, categoryId]);

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

                    if (!error && data?.explanation) {
                        currentQuestion.explanation_it = data.explanation;
                    }
                } catch (err) {
                    console.error('Failed to pre-fetch explanation:', err);
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
                />
            )}
        </PageTransition>
    );
};
