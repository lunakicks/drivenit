# Translation Service Guide

## Setup

### 1. Get OpenRouter API Key

1. Go to [OpenRouter](https://openrouter.ai/keys)
2. Sign up or log in
3. Create a new API key
4. Add it to your `.env` file:

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
```

### 2. Run Translation

```bash
node scripts/translate_content.js
```

## What It Does

The script translates content from Italian to English in two phases:

### Phase 1: Categories
- Fetches all categories without English translations (`title_en` is null)
- Translates `title_it` → `title_en`
- Updates directly in the `categories` table

### Phase 2: Questions
- Fetches questions without English translations
- For each question, translates:
  - `question_text_it` → English question text
  - `options_it` (array) → English options array
  - `explanation_it` → English explanation (if exists)
- Saves to the `translations` table with `language_code='en'`

## Rate Limiting

- **10 requests per minute** (6 seconds between requests)
- The script automatically delays between API calls
- Safe for OpenRouter's free tier limits

## Cost Estimation

Using the free model (`meta-llama/llama-3.1-8b-instruct:free`):
- **Cost: $0.00** (completely free)

If you want better quality, you can change the model to:
- `openai/gpt-3.5-turbo` (low cost, good quality)
- `anthropic/claude-3-haiku` (low cost, excellent quality)

Just update line 48 in the script.

## Progress Tracking

The script shows real-time progress:
```
🔄 [1/80] Translating question...
   ✅ Question translated
   ✅ Options translated: [True, False]
   ✅ Explanation translated
   💾 Saved to database
```

## Resume Support

If the script is interrupted:
- Already translated items are skipped automatically
- Just run the script again to continue from where it stopped

## Example Output

```
🌍 Starting Translation Service

📋 Configuration:
   - Source Language: Italian (it)
   - Target Language: English (en)
   - Rate Limit: 10 requests/minute
   - Model: meta-llama/llama-3.1-8b-instruct:free

📚 Translating Categories...
Found 3 categories to translate

🔄 Translating: "Segnali di indicazione"...
   ✅ "Indication Signs"

📊 Categories Summary: 3 translated, 0 failed

📝 Translating Questions...
Found 80 questions to translate

🔄 [1/80] Translating question...
   ✅ Question translated
   ✅ Options translated: [True, False]
   💾 Saved to database

✅ Translation process completed!
```

## Tips

- **Use during off-peak hours** if you have many questions (can take a while)
- **Monitor the console** for any errors
- **Check translations** in Supabase after completion
