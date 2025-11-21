import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { question_id, target_lang = 'en' } = await req.json()

        // Initialize Supabase Client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Check if translation already exists
        const { data: existingTranslation, error: fetchError } = await supabaseClient
            .from('translations')
            .select('*')
            .eq('question_id', question_id)
            .eq('language_code', target_lang)
            .single()

        if (existingTranslation) {
            return new Response(
                JSON.stringify({
                    question_text: existingTranslation.question_text,
                    explanation: existingTranslation.explanation,
                    options: existingTranslation.options
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 2. Fetch Original Question Data
        const { data: question, error: qError } = await supabaseClient
            .from('questions')
            .select('*')
            .eq('id', question_id)
            .single()

        if (qError || !question) throw new Error('Question not found')

        // 3. Prepare Prompt for OpenRouter
        const prompt = `
      You are a professional translator. Translate the following driving test question from Italian to ${target_lang === 'en' ? 'English' : target_lang}.
      
      Question: "${question.question_text_it}"
      Options: ${JSON.stringify(question.options_it)}
      Explanation: "${question.explanation_it || 'Not provided. Please generate a brief explanation for the correct answer.'}"
      Correct Answer Index: ${question.correct_option_index}
      
      Return ONLY a JSON object with the following structure:
      {
        "question_text": "Translated question text",
        "options": ["Translated Option 1", "Translated Option 2"],
        "explanation": "Translated explanation (or generated if original was missing)"
      }
    `

        // 4. Call OpenRouter
        const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://patente-app.com',
                'X-Title': 'Patente Learning App'
            },
            body: JSON.stringify({
                model: 'openai/gpt-oss-20b:free', // Using the requested free model
                messages: [{ role: 'user', content: prompt }]
            })
        })

        const aiData = await openRouterRes.json()
        const content = aiData.choices?.[0]?.message?.content

        if (!content) throw new Error('Failed to generate translation')

        // Parse JSON from AI response
        let translatedData;
        try {
            // Try to find JSON block if wrapped in markdown
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : content;
            translatedData = JSON.parse(jsonString);
        } catch (e) {
            console.error('Failed to parse AI response:', content);
            throw new Error('Invalid response format from AI');
        }

        // 5. Save to DB
        await supabaseClient
            .from('translations')
            .upsert({
                question_id,
                language_code: target_lang,
                question_text: translatedData.question_text,
                explanation: translatedData.explanation,
                options: translatedData.options
            }, { onConflict: 'question_id, language_code' })

        return new Response(
            JSON.stringify(translatedData),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
