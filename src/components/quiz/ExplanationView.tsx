import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';

interface ExplanationViewProps {
    isCorrect: boolean;
    explanation: string;
    onContinue: () => void;
}

export const ExplanationView: React.FC<ExplanationViewProps> = ({ isCorrect, explanation, onContinue }) => {
    return (
        <div className={clsx(
            "fixed bottom-0 left-0 right-0 p-4 pb-8 border-t-2 animate-bounce-sm",
            isCorrect ? "bg-feather-green/10 border-feather-green" : "bg-wrong-red/10 border-wrong-red"
        )}>
            <div className="max-w-md mx-auto flex flex-col gap-4">
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
            </div>
        </div>
    );
};
