import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { Zap, Target, AlertCircle } from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';

export const PracticePage: React.FC = () => {
    const { wrongAnswers } = useAuthStore();
    const navigate = useNavigate();

    return (
        <PageTransition>
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

                        {wrongAnswers.length > 0 ? (
                            <div className="mt-4">
                                <p className="text-sm text-hare-grey mb-3">You have {wrongAnswers.length} questions to review.</p>
                                <button
                                    onClick={() => navigate('/quiz/practice/mistakes')}
                                    className="w-full py-3 bg-feather-green rounded-xl font-bold text-white uppercase tracking-widest shadow-btn active:translate-y-[2px] active:shadow-none transition-all"
                                >
                                    Review Mistakes
                                </button>
                            </div>
                        ) : (
                            <div className="mt-4 p-4 bg-gray-50 rounded-xl text-center">
                                <p className="text-hare-grey font-medium">Great job! No mistakes to review.</p>
                            </div>
                        )}
                    </div>

                    {/* Test Simulation Mode */}
                    <div className="bg-white border-2 border-card-border rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-500">
                                <Zap size={24} strokeWidth={3} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-eel-grey">Test Simulation</h3>
                                <p className="text-hare-grey text-sm">30 random questions. No help.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/quiz/practice/test')}
                            className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold text-white uppercase tracking-widest shadow-btn active:translate-y-[2px] active:shadow-none transition-all"
                        >
                            Start Test
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
        </PageTransition>
    );
};
