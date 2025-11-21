import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizStore } from '../stores/useQuizStore';
import { useAuthStore } from '../stores/useAuthStore';
import { supabase } from '../lib/supabase';
import { QuizHeader } from '../components/quiz/QuizHeader';
import { FlashCard } from '../components/quiz/FlashCard';
import { ExplanationView } from '../components/quiz/ExplanationView';

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
        isComplete
    } = useQuizStore();

    const { user, bookmarks, flags, updateHearts, addXP, toggleBookmark, toggleFlag, checkStreak, recordWrongAnswer } = useAuthStore();

    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isChecked, setIsChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

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
            navigate('/'); // Or navigate to a "Lesson Complete" summary page
        }
    }, [isComplete, categoryId, navigate]);

    // Reset translation when question changes
    useEffect(() => {
        setTranslated(false);
        setTranslation(null);
    }, [currentQuestionIndex]);

    const currentQuestion = questions[currentQuestionIndex];

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

        // Check if explanation is missing and fetch it
        if (!currentQuestion.explanation_it) {
            try {
                const { data, error } = await supabase.functions.invoke('generate-explanation', {
                    body: { question_id: currentQuestion.id, target_lang: 'it' }
                });

                if (!error && data?.explanation) {
                    // Update local state (hacky but works for immediate feedback)
                    currentQuestion.explanation_it = data.explanation;
                    // Force re-render
                    setSelectedOption(selectedOption);
                }
            } catch (err) {
                console.error('Failed to generate explanation:', err);
            }
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
                    const explanationText = translated && translation
                        ? translation.explanation
                        : (currentQuestion.explanation_it || "Loading explanation...");
                    console.log('Rendering ExplanationView. Translated:', translated, 'Translation:', translation, 'Explanation Text:', explanationText);
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
    );
};
