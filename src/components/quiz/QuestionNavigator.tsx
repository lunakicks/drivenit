import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

interface QuestionNavigatorProps {
    totalQuestions: number;
    currentIndex: number;
    answeredQuestions: Set<number>;
    onNavigate: (index: number) => void;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
    totalQuestions,
    currentIndex,
    answeredQuestions,
    onNavigate
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1 bg-white border-2 border-card-border rounded-lg hover:bg-gray-50 transition-colors"
            >
                <span className="font-bold text-eel-grey text-sm">
                    Question {currentIndex + 1}/{totalQuestions}
                </span>
                {isOpen ? (
                    <ChevronUp size={16} className="text-hare-grey" />
                ) : (
                    <ChevronDown size={16} className="text-hare-grey" />
                )}
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute top-full mt-2 right-0 bg-white border-2 border-card-border rounded-xl shadow-lg p-4 z-50 w-80">
                        <h3 className="font-bold text-eel-grey mb-3">All Questions</h3>
                        <div className="grid grid-cols-6 gap-2">
                            {Array.from({ length: totalQuestions }, (_, i) => {
                                const isAnswered = answeredQuestions.has(i);
                                const isCurrent = i === currentIndex;

                                return (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            onNavigate(i);
                                            setIsOpen(false);
                                        }}
                                        className={clsx(
                                            "w-10 h-10 rounded-lg font-bold text-sm transition-all border-2",
                                            isCurrent && "border-sky-blue bg-sky-blue text-white",
                                            !isCurrent && isAnswered && "border-feather-green bg-feather-green/10 text-feather-green",
                                            !isCurrent && !isAnswered && "border-card-border bg-gray-50 text-hare-grey hover:bg-gray-100"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-4 pt-3 border-t border-card-border flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-sky-blue"></div>
                                <span className="text-hare-grey">Current</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-feather-green"></div>
                                <span className="text-hare-grey">Answered</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-gray-200 border border-card-border"></div>
                                <span className="text-hare-grey">Unanswered</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
