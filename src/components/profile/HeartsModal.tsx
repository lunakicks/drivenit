import React from 'react';
import { X, Heart, CheckCircle, XCircle, Award } from 'lucide-react';
import clsx from 'clsx';

interface HeartsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentHearts: number;
}

export const HeartsModal: React.FC<HeartsModalProps> = ({ isOpen, onClose, currentHearts }) => {
    if (!isOpen) return null;

    // Calculate time until midnight (hearts reset)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const hoursUntilReset = Math.floor((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));
    const minutesUntilReset = Math.floor(((tomorrow.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-6 pointer-events-auto animate-slideUp"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-wrong-red/10 rounded-xl flex items-center justify-center">
                                <Heart className="text-wrong-red fill-current" size={28} />
                            </div>
                            <h2 className="text-2xl font-extrabold text-eel-grey">Hearts System</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={24} className="text-hare-grey" />
                        </button>
                    </div>

                    {/* Current Status */}
                    <div className="bg-gradient-to-br from-wrong-red/10 to-wrong-red/5 p-4 rounded-2xl border-2 border-wrong-red/20">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-hare-grey uppercase tracking-wide">Current Hearts</span>
                            <div className="flex gap-1">
                                {Array.from({ length: 5 }, (_, i) => (
                                    <Heart
                                        key={i}
                                        size={20}
                                        className={clsx(
                                            i < currentHearts ? "text-wrong-red fill-current" : "text-gray-300"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-hare-grey">
                            Resets in {hoursUntilReset}h {minutesUntilReset}m
                        </p>
                    </div>

                    {/* How It Works */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-eel-grey">How It Works</h3>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-wrong-red/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <XCircle className="text-wrong-red" size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-eel-grey text-sm">Lose 1 Heart</p>
                                <p className="text-xs text-hare-grey">When you answer a question incorrectly</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-feather-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Award className="text-feather-green" size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-eel-grey text-sm">Gain 2 Hearts</p>
                                <p className="text-xs text-hare-grey">When you complete a category (max 5 hearts)</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-sky-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="text-sky-blue" size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-eel-grey text-sm">Daily Reset</p>
                                <p className="text-xs text-hare-grey">Hearts reset to 5 every day at midnight</p>
                            </div>
                        </div>
                    </div>

                    {/* Tip */}
                    <div className="bg-mustard-yellow/10 border-2 border-mustard-yellow/20 rounded-xl p-4">
                        <p className="text-sm font-bold text-eel-grey mb-1">💡 Pro Tip</p>
                        <p className="text-xs text-hare-grey">
                            Complete categories to earn bonus hearts and keep practicing even after mistakes!
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};
