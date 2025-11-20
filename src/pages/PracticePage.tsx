import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { MOCK_QUESTIONS } from '../data/questions';
import type { Question } from '../types';
import { Brain, Zap, Target, AlertCircle } from 'lucide-react';

export const PracticePage: React.FC = () => {
    const { wrongAnswers } = useAuthStore();
    const [wrongQuestions, setWrongQuestions] = useState<Question[]>([]);

    useEffect(() => {
        // Filter mock questions that are in the wrongAnswers array
        const foundQuestions = MOCK_QUESTIONS.filter(q => wrongAnswers.includes(q.id));
        setWrongQuestions(foundQuestions);
    }, [wrongAnswers]);

    return (
        <div className="p-6 pb-24">
            <h1 className="text-2xl font-bold text-eel-grey mb-6">Practice Hub</h1>

            <div className="grid grid-cols-1 gap-4">
                {/* Weakest Link / Mistakes Review */}
                <div className="bg-white border-2 border-card-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-500">
                            <AlertCircle size={24} strokeWidth={3} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-eel-grey">Mistakes Review</h3>
                            <p className="text-hare-grey text-sm">Review questions you got wrong</p>
                        </div>
                    </div>

                    {wrongQuestions.length > 0 ? (
                        <div className="mt-4">
                            <p className="text-sm text-hare-grey mb-3">You have {wrongQuestions.length} questions to review.</p>
                            <button className="w-full py-3 bg-feather-green rounded-xl font-bold text-white uppercase tracking-widest shadow-btn active:translate-y-[2px] active:shadow-none transition-all">
                                Review Mistakes
                            </button>
                        </div>
                    ) : (
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl text-center">
                            <p className="text-hare-grey font-medium">Great job! No mistakes to review.</p>
                        </div>
                    )}
                </div>

                {/* Other Practice Modes (Placeholders) */}
                <div className="bg-white border-2 border-card-border rounded-2xl p-6 shadow-sm opacity-75">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-500">
                            <Zap size={24} strokeWidth={3} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-eel-grey">Speed Review</h3>
                            <p className="text-hare-grey text-sm">Race against the clock</p>
                        </div>
                    </div>
                    <button disabled className="w-full py-3 bg-hare-grey rounded-xl font-bold text-white uppercase tracking-widest cursor-not-allowed">
                        Coming Soon
                    </button>
                </div>

                <div className="bg-white border-2 border-card-border rounded-2xl p-6 shadow-sm opacity-75">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-500">
                            <Target size={24} strokeWidth={3} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-eel-grey">Hard Mode</h3>
                            <p className="text-hare-grey text-sm">Challenge yourself</p>
                        </div>
                    </div>
                    <button disabled className="w-full py-3 bg-hare-grey rounded-xl font-bold text-white uppercase tracking-widest cursor-not-allowed">
                        Coming Soon
                    </button>
                </div>
            </div>
        </div>
    );
};
