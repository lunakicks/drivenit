import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, BookOpen, Trophy, Rocket, ChevronRight } from 'lucide-react';
import { OnboardingSlide } from '../components/onboarding/OnboardingSlide';
import { haptics } from '../utils/haptics';

const SLIDES = [
    {
        title: "Welcome to drivenit",
        description: "Master your Italian driving test with interactive practice designed to help you pass.",
        Icon: Flag,
        color: "#58CC02" // feather-green
    },
    {
        title: "Learn at Your Pace",
        description: "Practice questions organized by category with instant feedback and detailed explanations.",
        Icon: BookOpen,
        color: "#1CB0F6" // sky-blue
    },
    {
        title: "Track Your Progress",
        description: "Earn XP, maintain streaks, and watch your skills improve day by day.",
        Icon: Trophy,
        color: "#FFC800" // mustard-yellow
    },
    {
        title: "Ready to Begin?",
        description: "Join thousands of students preparing for their Italian driving test today.",
        Icon: Rocket,
        color: "#FF4B4B" // wrong-red
    }
];

export const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const handleNext = () => {
        haptics.selection();
        if (currentIndex < SLIDES.length - 1) {
            setDirection(1);
            setCurrentIndex(prev => prev + 1);
        } else {
            completeOnboarding();
        }
    };

    const completeOnboarding = () => {
        haptics.notification('success');
        localStorage.setItem('hasSeenOnboarding', 'true');
        navigate('/auth');
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    };

    return (
        <div className="min-h-screen bg-white flex flex-col safe-area-inset">
            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 }
                        }}
                        className="absolute inset-0"
                    >
                        <OnboardingSlide {...SLIDES[currentIndex]} />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="p-8 space-y-8">
                {/* Dots */}
                <div className="flex justify-center gap-2">
                    {SLIDES.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                ? 'w-8 bg-blue-500'
                                : 'w-2 bg-gray-200'
                                }`}
                        />
                    ))}
                </div>

                {/* Button */}
                <button
                    onClick={handleNext}
                    className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg active:translate-y-[2px] transition-all flex items-center justify-center gap-2"
                >
                    {currentIndex === SLIDES.length - 1 ? (
                        "Get Started"
                    ) : (
                        <>
                            Continue <ChevronRight size={20} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
