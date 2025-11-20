import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizStore } from '../stores/useQuizStore';
import { useAuthStore } from '../stores/useAuthStore';
import { QuizHeader } from '../components/quiz/QuizHeader';
import { FlashCard } from '../components/quiz/FlashCard';
import { ExplanationView } from '../components/quiz/ExplanationView';
import type { Question } from '../types';
import clsx from 'clsx';

// Mock Data for Quiz
const MOCK_QUESTIONS: Question[] = [
    {
        id: 'q1',
        category_id: '1',
        question_text_it: 'Il segnale raffigurato indica un divieto di sosta?',
        explanation_it: 'No, questo segnale indica un divieto di fermata, che è più restrittivo.',
        options_it: ['Vero', 'Falso'],
        correct_option_index: 1,
        difficulty_level: 1,
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Italian_traffic_signs_-_divieto_di_fermata.svg/1200px-Italian_traffic_signs_-_divieto_di_fermata.svg.png'
    },
    {
        id: 'q2',
        category_id: '1',
        question_text_it: 'Il segnale raffigurato preannuncia una curva pericolosa a destra?',
        explanation_it: 'Sì, questo è il segnale di curva pericolosa a destra.',
        options_it: ['Vero', 'Falso'],
        correct_option_index: 0,
        difficulty_level: 1,
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Italian_traffic_signs_-_curva_pericolosa_a_destra.svg/600px-Italian_traffic_signs_-_curva_pericolosa_a_destra.svg.png'
    }
];

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

    const { user, bookmarks, flags, updateHearts, addXP, toggleBookmark, toggleFlag, checkStreak } = useAuthStore();

    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isChecked, setIsChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    // Translation State
    const [translated, setTranslated] = useState(false);
    const [translation, setTranslation] = useState<{ q: string, explanation: string, opts: string[] } | null>(null);

    useEffect(() => {
        // In real app, fetch questions by categoryId
        startQuiz(MOCK_QUESTIONS);
    }, [categoryId, startQuiz]);

    useEffect(() => {
        if (isComplete) {
            navigate('/'); // Or navigate to a "Lesson Complete" summary page
        }
    }, [isComplete, navigate]);

    // Reset translation when question changes
    useEffect(() => {
        setTranslated(false);
        setTranslation(null);
    }, [currentQuestionIndex]);

    const currentQuestion = questions[currentQuestionIndex];

    if (!currentQuestion) return <div className="p-4">Loading...</div>;

    const handleCheck = () => {
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
                <div className="fixed bottom-0 w-full max-w-md border-t-2 border-card-border p-4 bg-white">
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
                <ExplanationView
                    isCorrect={isCorrect}
                    explanation={
                        translated && translation
                            ? translation.explanation
                            : (currentQuestion.explanation_it || "No explanation available.")
                    }
                    onContinue={handleContinue}
                />
            )}
        </div>
    );
};
