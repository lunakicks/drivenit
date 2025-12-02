import React, { useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Flag, Languages } from 'lucide-react';
import clsx from 'clsx';

interface ExplanationViewProps {
    isCorrect: boolean;
    explanation: string;
    onContinue: () => void;
    onFlag?: () => void;
    isFlagged?: boolean;
    onTranslate?: () => void;
    translated?: boolean;
    disableTranslation?: boolean;
}

export const ExplanationView: React.FC<ExplanationViewProps> = ({
    isCorrect,
    explanation,
    onContinue,
    onFlag,
    isFlagged = false,
    onTranslate,
    translated = false,
    disableTranslation = false
}) => {
    const [isMinimized, setIsMinimized] = useState(false);

    return (
        <div className={clsx(
            "fixed bottom-0 left-0 right-0 p-4 pb-8 border-t-2 transition-all duration-300",
            isCorrect ? "bg-feather-green/10 border-feather-green" : "bg-wrong-red/10 border-wrong-red",
            isMinimized && "pb-4"
        )}>
            <div className="max-w-md mx-auto flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isCorrect ? (
                            <CheckCircle className="text-feather-green fill-white" size={32} />
                        ) : (
                            <XCircle className="text-wrong-red fill-white" size={32} />
                        )}
                        <h3 className={clsx(
                            "text-2xl font-extrabold",
                            isCorrect ? "text-feather-green-dark" : "text-wrong-red-dark"
                        )}>
                            {isCorrect ? 'Excellent!' : 'Incorrect'}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {!disableTranslation && onTranslate && (
                            <button
                                onClick={onTranslate}
                                className={clsx(
                                    "p-2 rounded-lg transition-colors",
                                    translated ? "text-feather-green" : "text-hare-grey hover:text-sky-blue"
                                )}
                                aria-label={translated ? "Show original" : "Translate"}
                            >
                                <Languages size={20} />
                            </button>
                        )}
                        {onFlag && (
                            <button
                                onClick={onFlag}
                                className={clsx(
                                    "p-2 rounded-lg transition-colors",
                                    isFlagged ? "text-wrong-red" : "text-hare-grey hover:text-wrong-red"
                                )}
                                aria-label={isFlagged ? "Unflag question" : "Flag question"}
                            >
                                <Flag size={20} />
                            </button>
                        )}
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className={clsx(
                                "p-2 rounded-lg transition-colors",
                                isCorrect ? "hover:bg-feather-green/20" : "hover:bg-wrong-red/20"
                            )}
                            aria-label={isMinimized ? "Expand explanation" : "Minimize explanation"}
                        >
                            {isMinimized ? (
                                <ChevronUp className={isCorrect ? "text-feather-green" : "text-wrong-red"} size={24} />
                            ) : (
                                <ChevronDown className={isCorrect ? "text-feather-green" : "text-wrong-red"} size={24} />
                            )}
                        </button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {!isCorrect && (
                            <div className="bg-white p-4 rounded-xl border-2 border-wrong-red/20">
                                <h4 className="font-bold text-wrong-red-dark mb-1">Correct Solution:</h4>
                                <p className="text-eel-grey">{explanation}</p>
                            </div>
                        )}

                        <button
                            onClick={onContinue}
                            className={clsx(
                                "w-full py-3 rounded-xl font-extrabold text-white uppercase tracking-widest shadow-btn transition-transform active:translate-y-[4px] active:shadow-none",
                                isCorrect ? "bg-feather-green hover:bg-feather-green-dark" : "bg-wrong-red hover:bg-wrong-red-dark"
                            )}
                        >
                            Continue
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
