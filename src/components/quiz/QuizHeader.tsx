import React from 'react';
import { X, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuizHeaderProps {
    progress: number; // 0 to 100
    hearts: number;
}

export const QuizHeader: React.FC<QuizHeaderProps> = ({ progress, hearts }) => {
    const navigate = useNavigate();

    return (
        <div className="h-16 flex items-center px-4 gap-4 max-w-md mx-auto w-full bg-white">
            <button
                onClick={() => navigate('/')}
                className="text-hare-grey hover:bg-gray-100 p-2 rounded-xl transition-colors"
            >
                <X size={28} strokeWidth={2.5} />
            </button>

            {/* Progress Bar */}
            <div className="flex-1 h-4 bg-card-border rounded-full overflow-hidden relative">
                <div
                    className="absolute top-0 left-0 h-full bg-feather-green rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute top-1 right-2 w-4 h-1.5 bg-white/30 rounded-full" />
                </div>
            </div>

            <div className="flex items-center gap-1 text-wrong-red font-bold">
                <Heart className="fill-current animate-bounce-sm" size={28} />
                <span className="text-lg">{hearts}</span>
            </div>
        </div>
    );
};
