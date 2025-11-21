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
        const { question_id, target_lang = 'it' } = await req.json()

        // Initialize Supabase Client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Fetch Question Data
        const { data: question, error: qError } = await supabaseClient
            .from('questions')
            .select('*')
            .eq('id', question_id)
            .single()

        if (qError || !question) throw new Error('Question not found')

        // 2. Prepare Prompt for OpenRouter
        const prompt = `
      You are a driving instructor. Explain why the answer is correct for this question.
      Question: "${question.question_text_it}"
      Options: ${JSON.stringify(question.options_it)}
      Correct Answer Index: ${question.correct_option_index}
      
      Provide a concise explanation in ${target_lang === 'it' ? 'Italian' : 'English'}.
      Keep it under 2 sentences.
    `

        // 3. Call OpenRouter
        const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${Deno.env.get('OPENROUTER_API_KEY')}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://patente-app.com', // Required by OpenRouter
                'X-Title': 'Patente Learning App'
            },
            body: JSON.stringify({
                model: 'openai/gpt-3.5-turbo', // Can be changed to any model supported by OpenRouter
                messages: [{ role: 'user', content: prompt }]
            })
        })

        const aiData = await openRouterRes.json()
        const explanation = aiData.choices?.[0]?.message?.content

        if (!explanation) throw new Error('Failed to generate explanation')

        // 4. Save to DB
        if (target_lang === 'it') {
            await supabaseClient
                .from('questions')
                .update({ explanation_it: explanation })
                .eq('id', question_id)
        } else {
            // Upsert translation
            await supabaseClient
                .from('translations')
                .upsert({
                    question_id,
                    language_code: target_lang,
                    explanation: explanation,
                    // We preserve existing fields if we are just updating explanation, 
                    // but upsert requires all non-null fields if creating new.
                    // For simplicity, we assume we might be creating a partial translation record.
                }, { onConflict: 'question_id, language_code' })
        }

        return new Response(
            JSON.stringify({ explanation }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
