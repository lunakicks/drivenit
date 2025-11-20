import { supabase } from './supabase';

export interface TranslationResult {
    question_text: string;
    explanation: string;
    options: string[];
}

// Mock translations for demo
const MOCK_TRANSLATIONS: Record<string, Record<string, TranslationResult>> = {
    'q1': {
        'en': {
            question_text: 'Does the sign shown indicate a parking ban?',
            explanation: 'No, this sign indicates a stopping ban, which is more restrictive.',
            options: ['True', 'False']
        }
    },
    'q2': {
        'en': {
            question_text: 'Does the sign shown warn of a dangerous curve to the right?',
            explanation: 'Yes, this is the sign for a dangerous curve to the right.',
            options: ['True', 'False']
        }
    }
};

export const translateQuestion = async (questionId: string, targetLang: string): Promise<TranslationResult | null> => {
    // 1. Check local cache or mock data
    if (MOCK_TRANSLATIONS[questionId]?.[targetLang]) {
        return MOCK_TRANSLATIONS[questionId][targetLang];
    }

    // 2. Check Supabase 'translations' table
    const { data } = await supabase
        .from('translations')
        .select('*')
        .eq('question_id', questionId)
        .eq('language_code', targetLang)
        .single();

    if (data) {
        return {
            question_text: data.question_text,
            explanation: data.explanation,
            options: data.options as string[]
        };
    }

    // 3. Call external API (Mocked here)
    // In a real app, you would call an Edge Function here that calls OpenAI/DeepL
    console.log(`Translating ${questionId} to ${targetLang}...`);
    return null;
};
