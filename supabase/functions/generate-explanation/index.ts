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

        // 2. Check if explanation already exists
        if (target_lang === 'it' && question.explanation_it) {
            return new Response(
                JSON.stringify({ explanation: question.explanation_it }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Check translation table if target is not IT
        if (target_lang !== 'it') {
            const { data: existingTranslation } = await supabaseClient
                .from('translations')
                .select('explanation')
                .eq('question_id', question_id)
                .eq('language_code', target_lang)
                .single()

            if (existingTranslation?.explanation) {
                return new Response(
                    JSON.stringify({ explanation: existingTranslation.explanation }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }
        }

        // 3. Prepare Prompt for OpenRouter
        const prompt = `
      You are an expert driving instructor. The student answered the following question about Italian road rules.
      
      Question: "${question.question_text_it}"
      Options: ${JSON.stringify(question.options_it)}
      Correct Answer Index: ${question.correct_option_index} (0-based)
      
      Please provide a clear, helpful, and meaningful explanation of WHY this is the correct answer. 
      Explain the specific road rule or sign meaning involved.
      
      Target Language: ${target_lang === 'it' ? 'Italian' : 'English'}
      Length: 2-3 sentences.
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
                model: 'openai/gpt-3.5-turbo',
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
