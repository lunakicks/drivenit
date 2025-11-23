import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Home, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

interface CompletionModalProps {
    xpEarned: number;
    correctAnswers: number;
    totalQuestions: number;
    onHome: () => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
    xpEarned,
    correctAnswers,
    totalQuestions,
    onHome
}) => {
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                {/* Header */}
                <div className="bg-mustard-yellow p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="z-10"
                    >
                        <Trophy size={64} className="text-white mb-4 drop-shadow-md" />
                        <h2 className="text-3xl font-extrabold text-white tracking-wide uppercase drop-shadow-sm">
                            Section Complete!
                        </h2>
                    </motion.div>

                    {/* Background decorations */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-20">
                        <div className="absolute top-4 left-4 w-16 h-16 bg-white rounded-full blur-xl"></div>
                        <div className="absolute bottom-4 right-4 w-24 h-24 bg-white rounded-full blur-xl"></div>
                    </div>
                </div>

                {/* Stats Body */}
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-swan-white border-2 border-card-border rounded-2xl p-4 flex flex-col items-center">
                            <span className="text-hare-grey font-bold uppercase text-xs tracking-wider mb-1">XP Earned</span>
                            <div className="flex items-center gap-2 text-mustard-yellow">
                                <Star className="fill-current" size={24} />
                                <span className="text-3xl font-extrabold">+{xpEarned}</span>
                            </div>
                        </div>
                        <div className="bg-swan-white border-2 border-card-border rounded-2xl p-4 flex flex-col items-center">
                            <span className="text-hare-grey font-bold uppercase text-xs tracking-wider mb-1">Accuracy</span>
                            <div className="text-feather-green text-3xl font-extrabold">
                                {accuracy}%
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-eel-grey font-medium">
                        You answered <span className="font-bold text-feather-green">{correctAnswers}</span> out of <span className="font-bold">{totalQuestions}</span> questions correctly.
                    </div>

                    <button
                        onClick={onHome}
                        className="w-full py-4 bg-feather-green hover:bg-feather-green-dark text-white rounded-xl font-extrabold uppercase tracking-widest shadow-btn transition-transform active:translate-y-[4px] active:shadow-none flex items-center justify-center gap-2"
                    >
                        <span>Continue</span>
                        <ArrowRight size={20} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
