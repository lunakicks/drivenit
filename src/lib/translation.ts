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

        if (data && data.explanation) {
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
            // Sanitize data to ensure no objects are passed to React children
            const safeExplanation = typeof funcData.explanation === 'object'
                ? JSON.stringify(funcData.explanation)
                : String(funcData.explanation || '');

            const safeOptions = Array.isArray(funcData.options)
                ? funcData.options.map((opt: any) => typeof opt === 'object' ? JSON.stringify(opt) : String(opt))
                : [];

            const safeQuestion = typeof funcData.question_text === 'object'
                ? JSON.stringify(funcData.question_text)
                : String(funcData.question_text || '');

            return {
                question_text: safeQuestion,
                explanation: safeExplanation,
                options: safeOptions
            };
        }

        return null;
    } catch (error) {
        console.error('Translation failed:', error);
        return null;
    }
};
