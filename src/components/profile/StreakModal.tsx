import React from 'react';
import { X, Calendar, Flame } from 'lucide-react';
import clsx from 'clsx';

interface StreakModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentStreak: number;
    lastStudyDate?: string;
}

export const StreakModal: React.FC<StreakModalProps> = ({ isOpen, onClose, currentStreak, lastStudyDate }) => {
    if (!isOpen) return null;

    // Generate last 7 days for calendar
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - (6 - i));
        return date;
    });

    const lastStudy = lastStudyDate ? new Date(lastStudyDate) : null;
    const todayStr = today.toISOString().split('T')[0];

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
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                                <Flame className="text-white" size={28} />
                            </div>
                            <h2 className="text-2xl font-extrabold text-eel-grey">Day Streak</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={24} className="text-hare-grey" />
                        </button>
                    </div>

                    {/* Current Streak */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border-2 border-orange-200 text-center">
                        <Flame className="text-orange-500 mx-auto mb-3" size={48} />
                        <div className="text-5xl font-extrabold text-orange-500 mb-2">{currentStreak}</div>
                        <p className="text-sm font-bold text-hare-grey uppercase tracking-wide">Day Streak</p>
                    </div>

                    {/* Calendar */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-hare-grey" />
                            <h3 className="font-bold text-eel-grey">Last 7 Days</h3>
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                            {last7Days.map((date, i) => {
                                const dateStr = date.toISOString().split('T')[0];
                                const isToday = dateStr === todayStr;
                                const isStudied = lastStudy && dateStr <= lastStudy.toISOString().split('T')[0] &&
                                    dateStr >= new Date(lastStudy.getTime() - (currentStreak - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                                return (
                                    <div key={i} className="text-center">
                                        <div className="text-xs font-bold text-hare-grey mb-1">
                                            {date.toLocaleDateString('en-US', { weekday: 'short' })[0]}
                                        </div>
                                        <div
                                            className={clsx(
                                                "w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold border-2",
                                                isStudied && "bg-feather-green border-feather-green text-white",
                                                !isStudied && "bg-gray-100 border-gray-200 text-hare-grey",
                                                isToday && "ring-2 ring-sky-blue ring-offset-2"
                                            )}
                                        >
                                            {date.getDate()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-eel-grey">How It Works</h3>
                        <div className="space-y-2 text-sm text-hare-grey">
                            <p>• Study at least once per day to maintain your streak</p>
                            <p>• Miss a day and your streak resets to 0</p>
                            <p>• Build consistency to reach higher streaks!</p>
                        </div>
                    </div>

                    {/* Motivation */}
                    <div className="bg-gradient-to-r from-feather-green/10 to-sky-blue/10 border-2 border-feather-green/20 rounded-xl p-4">
                        <p className="text-sm font-bold text-eel-grey mb-1">🎯 Keep Going!</p>
                        <p className="text-xs text-hare-grey">
                            {currentStreak === 0
                                ? "Start your streak today by answering questions!"
                                : `You're on a ${currentStreak}-day streak! Don't break it!`}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};
