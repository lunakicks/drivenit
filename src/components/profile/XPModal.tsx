import React from 'react';
import { X, Zap, Trophy, Target } from 'lucide-react';

interface XPModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentXP: number;
    completedCategories: number;
}

export const XPModal: React.FC<XPModalProps> = ({ isOpen, onClose, currentXP, completedCategories }) => {
    if (!isOpen) return null;

    const progressToNext = currentXP % 100;
    const level = Math.floor(currentXP / 100) + 1;

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
                            <div className="w-12 h-12 bg-mustard-yellow/10 rounded-xl flex items-center justify-center">
                                <Zap className="text-mustard-yellow fill-current" size={28} />
                            </div>
                            <h2 className="text-2xl font-extrabold text-eel-grey">Experience Points</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={24} className="text-hare-grey" />
                        </button>
                    </div>

                    {/* Current XP */}
                    <div className="bg-gradient-to-br from-mustard-yellow/10 to-mustard-yellow/5 p-6 rounded-2xl border-2 border-mustard-yellow/20 text-center">
                        <div className="text-5xl font-extrabold text-mustard-yellow mb-2">{currentXP}</div>
                        <p className="text-sm font-bold text-hare-grey uppercase tracking-wide">Total XP</p>
                    </div>

                    {/* Level Progress */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-eel-grey">Level {level}</span>
                            <span className="text-xs font-bold text-hare-grey">{progressToNext}/100 XP</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-mustard-yellow to-feather-green h-full transition-all duration-500"
                                style={{ width: `${progressToNext}%` }}
                            />
                        </div>
                        <p className="text-xs text-hare-grey text-center">
                            {100 - progressToNext} XP until Level {level + 1}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-feather-green/10 p-4 rounded-xl border-2 border-feather-green/20 text-center">
                            <Trophy className="text-feather-green mx-auto mb-2" size={24} />
                            <div className="text-2xl font-bold text-eel-grey">{completedCategories}</div>
                            <p className="text-xs font-bold text-hare-grey uppercase tracking-wide">Categories</p>
                        </div>
                        <div className="bg-sky-blue/10 p-4 rounded-xl border-2 border-sky-blue/20 text-center">
                            <Target className="text-sky-blue mx-auto mb-2" size={24} />
                            <div className="text-2xl font-bold text-eel-grey">{Math.floor(currentXP / 10)}</div>
                            <p className="text-xs font-bold text-hare-grey uppercase tracking-wide">Correct</p>
                        </div>
                    </div>

                    {/* How to Earn */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-eel-grey">How to Earn XP</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-eel-grey">Correct Answer</span>
                                <span className="text-sm font-bold text-feather-green">+10 XP</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium text-eel-grey">Complete Category</span>
                                <span className="text-sm font-bold text-mustard-yellow">+2 Hearts</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
