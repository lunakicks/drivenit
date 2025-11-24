import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    icon?: React.ReactNode;
}

export const InfoModal: React.FC<InfoModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    icon
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-hare-grey hover:bg-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8 flex flex-col items-center text-center space-y-4">
                        {icon && (
                            <div className="mb-2 transform scale-125">
                                {icon}
                            </div>
                        )}

                        <h2 className="text-2xl font-bold text-eel-grey">
                            {title}
                        </h2>

                        <p className="text-hare-grey font-medium leading-relaxed">
                            {description}
                        </p>

                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-sky-blue hover:bg-sky-blue-dark text-white rounded-xl font-bold uppercase tracking-widest shadow-btn active:translate-y-[2px] active:shadow-none transition-all mt-4"
                        >
                            Got it
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
