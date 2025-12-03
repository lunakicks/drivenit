import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface OnboardingSlideProps {
    title: string;
    description: string;
    Icon: LucideIcon;
    color: string;
}

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({ title, description, Icon, color }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-8">
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={`w-40 h-40 rounded-full flex items-center justify-center bg-${color}-100`}
                style={{ backgroundColor: `${color}20` }} // Fallback for dynamic colors
            >
                <Icon size={80} className={`text-${color}`} style={{ color: color }} />
            </motion.div>

            <div className="space-y-4">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold text-gray-800"
                >
                    {title}
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg text-gray-500 leading-relaxed"
                >
                    {description}
                </motion.p>
            </div>
        </div>
    );
};
