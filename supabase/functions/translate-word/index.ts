import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { text, target_lang = 'en' } = await req.json()

        if (!text) {
            throw new Error('Text is required')
        }

        // Call Google Translate Free API (gtx)
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target_lang}&dt=t&q=${encodeURIComponent(text)}`

        const response = await fetch(url)
        const data = await response.json()

        // Parse gtx response: [[["Translated Text","Original Text",...]], ...]
        const translatedText = data[0]?.[0]?.[0]

        if (!translatedText) {
            throw new Error('Translation failed')
        }

        return new Response(
            JSON.stringify({ translatedText }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
