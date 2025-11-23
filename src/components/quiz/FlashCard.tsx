import React from 'react';
import { Volume2, Bookmark, Languages, Flag } from 'lucide-react';
import clsx from 'clsx';
import type { Question } from '../../types';
import { translateQuestion } from '../../lib/translation';
import { InteractiveText } from './InteractiveText';

interface FlashCardProps {
    question: Question;
    selectedOptionIndex: number | null;
    onOptionSelect: (index: number) => void;
    isChecked: boolean;
    onBookmark: () => void;
    onFlag: () => void;
    isBookmarked?: boolean;
    isFlagged?: boolean;
    translated: boolean;
    setTranslated: (value: boolean) => void;
    translation: { q: string, explanation: string, opts: string[] } | null;
    setTranslation: (value: { q: string, explanation: string, opts: string[] } | null) => void;
    disableTranslation?: boolean;
}

export const FlashCard: React.FC<FlashCardProps> = ({
    question,
    selectedOptionIndex,
    onOptionSelect,
    isChecked,
    onBookmark,
    onFlag,
    isBookmarked = false,
    isFlagged = false,
    translated,
    setTranslated,
    translation,
    setTranslation,
    disableTranslation = false
}) => {
    const handleTranslate = async () => {
        if (translated) {
            setTranslated(false);
            return;
        }

        if (!translation) {
            console.log('Fetching translation for question:', question.id);
            const result = await translateQuestion(question.id, 'en'); // Hardcoded 'en' for now
            console.log('Translation result:', result);
            if (result) {
                setTranslation({ q: result.question_text, explanation: result.explanation, opts: result.options });
            }
        }
        setTranslated(true);
    };

    const displayText = translated && translation ? translation.q : question.question_text_it;
    const displayOptions = translated && translation ? translation.opts : question.options_it;

    return (
        <div className="flex-1 flex flex-col p-4 pb-32 overflow-y-auto max-w-md mx-auto w-full">
            <h2 className="text-2xl font-bold text-eel-grey mb-6">Select the correct answer</h2>

            {/* Question Card */}
            <div className="flex gap-4 mb-8">
                {question.image_url && (
                    <div className="w-24 h-24 bg-gray-100 rounded-xl border-2 border-card-border flex-shrink-0 overflow-hidden">
                        <img src={question.image_url} alt="Question" className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2">
                        <button className="p-2 bg-sky-blue text-white rounded-xl shadow-btn active:translate-y-[2px] active:shadow-none transition-all">
                            <Volume2 size={24} />
                        </button>
                        <div className="p-3 border-2 border-card-border rounded-2xl rounded-tl-none bg-white relative group">
                            <InteractiveText text={displayText} className="text-lg text-eel-grey font-medium" />
                        </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                        {!disableTranslation && (
                            <button
                                onClick={handleTranslate}
                                className={clsx(
                                    "transition-colors text-sm font-bold uppercase tracking-wide flex items-center gap-1",
                                    translated ? "text-feather-green" : "text-hare-grey hover:text-sky-blue"
                                )}
                            >
                                <Languages size={16} /> {translated ? 'Original' : 'Translate'}
                            </button>
                        )}
                        <button
                            onClick={onFlag}
                            className={clsx(
                                "transition-colors text-sm font-bold uppercase tracking-wide flex items-center gap-1",
                                isFlagged ? "text-wrong-red" : "text-hare-grey hover:text-wrong-red"
                            )}
                        >
                            <Flag size={16} /> Report
                        </button>
                        <button
                            onClick={onBookmark}
                            className={clsx(
                                "transition-colors text-sm font-bold uppercase tracking-wide flex items-center gap-1",
                                isBookmarked ? "text-mustard-yellow" : "text-hare-grey hover:text-mustard-yellow"
                            )}
                        >
                            <Bookmark size={16} /> Save
                        </button>
                    </div>
                </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
                {displayOptions.map((option, index) => {
                    const isSelected = selectedOptionIndex === index;
                    const showCorrect = isChecked && index === question.correct_option_index;
                    const showWrong = isChecked && isSelected && index !== question.correct_option_index;

                    return (
                        <button
                            key={index}
                            onClick={() => !isChecked && onOptionSelect(index)}
                            disabled={isChecked}
                            className={clsx(
                                "w-full p-4 rounded-xl border-2 border-b-4 text-left transition-all active:border-b-2 active:translate-y-[2px]",
                                isSelected && !isChecked && "bg-sky-blue/10 border-sky-blue text-sky-blue-dark",
                                !isSelected && !isChecked && "bg-white border-card-border hover:bg-gray-50 text-eel-grey",
                                showCorrect && "bg-feather-green/10 border-feather-green text-feather-green-dark",
                                showWrong && "bg-wrong-red/10 border-wrong-red text-wrong-red-dark",
                                !isSelected && isChecked && !showCorrect && "opacity-50"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-lg">{option}</span>
                                <div className={clsx(
                                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center text-xs font-bold",
                                    isSelected && !isChecked ? "border-sky-blue text-sky-blue" : "border-card-border text-card-border",
                                    showCorrect && "border-feather-green bg-feather-green text-white border-none",
                                    showWrong && "border-wrong-red bg-wrong-red text-white border-none"
                                )}>
                                    {index + 1}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
