import React from 'react';
import { X, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuestionNavigator } from './QuestionNavigator';

interface QuizHeaderProps {
    progress: number;
    hearts: number;
    reviewProgress?: { current: number; total: number } | null;
    questionNavigator?: {
        totalQuestions: number;
        currentIndex: number;
        answeredQuestions: Set<number>;
        onNavigate: (index: number) => void;
    } | null;
}

export const QuizHeader: React.FC<QuizHeaderProps> = ({
    progress,
    hearts,
    reviewProgress,
    questionNavigator
}) => {
    const navigate = useNavigate();

    return (
        <div className="sticky top-0 bg-white border-b-2 border-card-border p-4 z-20">
            <div className="max-w-md mx-auto flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X size={24} className="text-hare-grey" />
                </button>

                <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                        className="bg-feather-green h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {questionNavigator && (
                    <QuestionNavigator
                        totalQuestions={questionNavigator.totalQuestions}
                        currentIndex={questionNavigator.currentIndex}
                        answeredQuestions={questionNavigator.answeredQuestions}
                        onNavigate={questionNavigator.onNavigate}
                    />
                )}

                {reviewProgress && (
                    <div className="px-3 py-1 bg-sky-blue/10 border-2 border-sky-blue rounded-lg">
                        <span className="text-sky-blue font-bold text-sm">
                            {reviewProgress.current}/{reviewProgress.total}
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-1 text-wrong-red font-bold">
                    <Heart className="fill-current" size={24} />
                    <span>{hearts}</span>
                </div>
            </div>
        </div>
    );
};
