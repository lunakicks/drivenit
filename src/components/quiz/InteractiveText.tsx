import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import clsx from 'clsx';

interface InteractiveTextProps {
    text: string;
    className?: string;
}

export const InteractiveText: React.FC<InteractiveTextProps> = ({ text, className }) => {
    const [selectedWord, setSelectedWord] = useState<{ word: string, translation: string | null, index: number } | null>(null);
    const [loading, setLoading] = useState(false);

    // Split text into words but keep punctuation attached or separate?
    // Simple split by space for now, improved regex later if needed.
    const words = text.split(' ');

    const handleWordClick = async (word: string, index: number) => {
        // Clean word of punctuation for translation
        const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

        if (!cleanWord) return;

        if (selectedWord?.index === index) {
            setSelectedWord(null); // Toggle off
            return;
        }

        setSelectedWord({ word: cleanWord, translation: null, index });
        setLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke('translate-word', {
                body: { text: cleanWord, target_lang: 'en' } // Hardcoded 'en' for now, could be prop
            });

            if (error) throw error;

            setSelectedWord({ word: cleanWord, translation: data.translatedText, index });
        } catch (err) {
            console.error('Word translation failed:', err);
            setSelectedWord({ word: cleanWord, translation: 'Error', index });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={clsx("leading-relaxed", className)}>
            {words.map((word, i) => (
                <span key={i} className="relative inline-block mr-1">
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            handleWordClick(word, i);
                        }}
                        className={clsx(
                            "cursor-pointer hover:bg-sky-blue/20 rounded px-0.5 transition-colors",
                            selectedWord?.index === i && "bg-sky-blue/30 text-sky-blue-dark font-semibold"
                        )}
                    >
                        {word}
                    </span>

                    {/* Tooltip */}
                    {selectedWord?.index === i && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-eel-grey text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-10 animate-in fade-in zoom-in duration-200">
                            {loading ? (
                                <span className="animate-pulse">...</span>
                            ) : (
                                selectedWord.translation
                            )}
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-eel-grey"></div>
                        </div>
                    )}
                </span>
            ))}
        </div>
    );
};
