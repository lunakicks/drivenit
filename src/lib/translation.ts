import { supabase } from './supabase';

export interface TranslationResult {
    question_text: string;
    explanation: string;
    options: string[];
}



export const translateQuestion = async (questionId: string, targetLang: string): Promise<TranslationResult | null> => {
    try {
        // 1. Check Supabase 'translations' table first (Client-side cache check)
        // Note: The Edge Function also checks this, but checking here saves a function invocation
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

        // 2. Call Edge Function
        console.log(`Invoking translate-content for ${questionId} to ${targetLang}...`);
        const { data: funcData, error: funcError } = await supabase.functions.invoke('translate-content', {
            body: { question_id: questionId, target_lang: targetLang }
        });

        if (funcError) {
            console.error('Edge Function Error:', funcError);
            throw funcError;
        }

        if (funcData) {
            return {
                question_text: funcData.question_text,
                explanation: funcData.explanation,
                options: funcData.options
            };
        }

        return null;
    } catch (error) {
        console.error('Translation failed:', error);
        return null;
    }
};
