import React from 'react';
import { Dumbbell, Zap, Brain } from 'lucide-react';

export const PracticePage: React.FC = () => {
    const practiceModes = [
        {
            title: 'Weakest Link',
            description: 'Review questions you missed recently.',
            icon: <Zap className="text-yellow-500" size={32} />,
            color: 'bg-yellow-500',
            available: true
        },
        {
            title: 'Hard Mode',
            description: 'Challenge yourself with the toughest questions.',
            icon: <Dumbbell className="text-red-500" size={32} />,
            color: 'bg-red-500',
            available: false
        },
        {
            title: 'Smart Review',
            description: 'AI-curated review based on your progress.',
            icon: <Brain className="text-purple-500" size={32} />,
            color: 'bg-purple-500',
            available: false
        }
    ];

    return (
        <div className="p-6 pb-24">
            <h1 className="text-2xl font-bold text-eel-grey mb-6">Practice Center</h1>

            <div className="space-y-4">
                {practiceModes.map((mode, index) => (
                    <button
                        key={index}
                        disabled={!mode.available}
                        className={`w-full bg-white border-2 border-card-border rounded-xl p-4 flex items-center gap-4 text-left transition-transform active:translate-y-[2px] ${!mode.available ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    >
                        <div className={`w-16 h-16 ${mode.color}/10 rounded-xl flex items-center justify-center`}>
                            {mode.icon}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-eel-grey">{mode.title}</h3>
                            <p className="text-sm text-hare-grey">{mode.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
