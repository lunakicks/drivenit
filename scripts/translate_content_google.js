import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file.');
    process.exit(1);
}

if (!GOOGLE_API_KEY) {
    console.error('❌ Error: Missing GOOGLE_API_KEY in .env file.');
    console.error('Get your API key from: https://aistudio.google.com/app/apikey');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// Parse command line arguments for verbose mode
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

// Rate limiting: 10 requests per minute = 6000ms between requests
const RATE_LIMIT_DELAY = 6000;
const TARGET_LANGUAGE = 'en'; // English
const PROGRESS_INTERVAL = 5; // Log every N questions in non-verbose mode

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function translateText(text, fromLang = 'it', toLang = 'en', overrideSystemPrompt = null) {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

    let prompt;
    if (overrideSystemPrompt) {
        prompt = `${overrideSystemPrompt}\n\n${text}`;
    } else {
        prompt = `Translate the following text from ${fromLang === 'it' ? 'Italian' : fromLang} to ${toLang === 'en' ? 'English' : toLang}. Provide ONLY the translation, no explanations or additional text.

Text to translate: ${text}`;
    }

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text().trim();
}

async function translateCategories() {
    console.log('\n📚 Translating Categories...\n');

    const { data: categories, error } = await supabase
        .from('categories')
        .select('id, slug, title_it, title_en')
        .or('title_en.is.null,title_en.eq.');

    if (error) {
        console.error('❌ Error fetching categories:', error.message);
        return;
    }

    if (!categories || categories.length === 0) {
        console.log('✅ All categories already translated!');
        return;
    }

    console.log(`Found ${categories.length} categories to translate\n`);

    let translated = 0;
    let failed = 0;

    for (const category of categories) {
        try {
            if (VERBOSE) {
                console.log(`🔄 Translating: "${category.title_it}"...`);
            }

            const translatedTitle = await translateText(category.title_it);

            const { error: updateError } = await supabase
                .from('categories')
                .update({ title_en: translatedTitle })
                .eq('id', category.id);

            if (updateError) {
                console.error(`   ❌ Failed to update: ${updateError.message}`);
                failed++;
            } else {
                if (VERBOSE) {
                    console.log(`   ✅ "${translatedTitle}"`);
                }
                translated++;
            }

            await delay(RATE_LIMIT_DELAY);

        } catch (error) {
            console.error(`   ❌ Translation error: ${error.message}`);
            failed++;
        }

        if (!VERBOSE && translated % PROGRESS_INTERVAL === 0) {
            console.log(`📊 Progress: ${translated}/${categories.length} categories translated`);
        }
    }

    console.log(`\n📊 Categories Summary: ${translated} translated, ${failed} failed\n`);
}

async function translateQuestions() {
    console.log('\n📝 Translating Questions...\n');

    const { data: questions, error } = await supabase
        .from('questions')
        .select('id, question_text_it, explanation_it, options_it, correct_option_index')
        .limit(500);

    if (error) {
        console.error('❌ Error fetching questions:', error.message);
        return;
    }

    if (!questions || questions.length === 0) {
        console.log('✅ No questions found!');
        return;
    }

    const questionsToTranslate = [];
    for (const question of questions) {
        const { data: existingTranslation } = await supabase
            .from('translations')
            .select('id, explanation')
            .eq('question_id', question.id)
            .eq('language_code', TARGET_LANGUAGE)
            .single();

        // We process if translation is missing OR if explanation_it is missing (to generate it)
        // OR if translation exists but is missing the explanation
        if (!existingTranslation || !question.explanation_it || (!existingTranslation.explanation && question.explanation_it)) {
            questionsToTranslate.push(question);
        }
    }

    if (questionsToTranslate.length === 0) {
        console.log('✅ All questions already translated and have explanations!');
        return;
    }

    console.log(`Found ${questionsToTranslate.length} questions to process\n`);

    let translated = 0;
    let failed = 0;

    for (let i = 0; i < questionsToTranslate.length; i++) {
        const question = questionsToTranslate[i];

        try {
            if (VERBOSE) {
                console.log(`🔄 [${i + 1}/${questionsToTranslate.length}] Processing question...`);
            }

            // 1. Generate Explanation if missing
            if (!question.explanation_it) {
                if (VERBOSE) {
                    console.log(`   ✨ Generating explanation...`);
                }

                const correctAnswer = question.options_it[question.correct_option_index];
                const prompt = `You are an experienced italian driving instructor. Answer why the answer "${correctAnswer}" is correct for the question: "${question.question_text_it}". The explanation should be concise and in Italian.`;

                const generatedExplanation = await translateText(prompt, 'it', 'it', 'You are a helpful AI assistant.');

                // Update question in DB
                const { error: updateError } = await supabase
                    .from('questions')
                    .update({ explanation_it: generatedExplanation })
                    .eq('id', question.id);

                if (updateError) {
                    console.error(`   ❌ Failed to save generated explanation: ${updateError.message}`);
                } else {
                    question.explanation_it = generatedExplanation; // Update local object
                    if (VERBOSE) {
                        console.log(`   ✅ Explanation generated and saved`);
                    }
                }
                await delay(RATE_LIMIT_DELAY);
            }

            // 2. Check if translation exists again (in case we only needed to generate explanation)
            const { data: existingTranslation } = await supabase
                .from('translations')
                .select('id, explanation')
                .eq('question_id', question.id)
                .eq('language_code', TARGET_LANGUAGE)
                .single();

            if (existingTranslation) {
                // If translation exists but is missing the explanation, and we have one now
                if (!existingTranslation.explanation && question.explanation_it) {
                    if (VERBOSE) {
                        console.log(`   ✨ Translating and updating missing explanation...`);
                    }
                    const translatedExplanation = await translateText(question.explanation_it);

                    const { error: updateError } = await supabase
                        .from('translations')
                        .update({ explanation: translatedExplanation })
                        .eq('id', existingTranslation.id);

                    if (updateError) {
                        console.error(`   ❌ Failed to update translation with explanation: ${updateError.message}`);
                    } else if (VERBOSE) {
                        console.log(`   ✅ Translation updated with explanation`);
                    }
                    await delay(RATE_LIMIT_DELAY);
                } else {
                    if (VERBOSE) {
                        console.log(`   ✅ Translation already exists, skipping.`);
                    }
                }
                continue;
            }

            // 3. Translate Content
            const translatedQuestion = await translateText(question.question_text_it);
            if (VERBOSE) {
                console.log(`   ✅ Question translated`);
            }

            await delay(RATE_LIMIT_DELAY);

            const translatedOptions = [];
            for (const option of question.options_it) {
                const translatedOption = await translateText(option);
                translatedOptions.push(translatedOption);
                await delay(RATE_LIMIT_DELAY);
            }
            if (VERBOSE) {
                console.log(`   ✅ Options translated: [${translatedOptions.join(', ')}]`);
            }

            let translatedExplanation = null;
            if (question.explanation_it) {
                translatedExplanation = await translateText(question.explanation_it);
                if (VERBOSE) {
                    console.log(`   ✅ Explanation translated`);
                }
                await delay(RATE_LIMIT_DELAY);
            }

            const { error: insertError } = await supabase
                .from('translations')
                .insert({
                    question_id: question.id,
                    language_code: TARGET_LANGUAGE,
                    question_text: translatedQuestion,
                    explanation: translatedExplanation,
                    options: translatedOptions
                });

            if (insertError) {
                console.error(`   ❌ Failed to save translation: ${insertError.message}`);
                failed++;
            } else {
                if (VERBOSE) {
                    console.log(`   💾 Saved to database\n`);
                }
                translated++;
            }

        } catch (error) {
            console.error(`   ❌ Error: ${error.message}\n`);
            failed++;
        }

        if (!VERBOSE && (translated % PROGRESS_INTERVAL === 0 || translated === questionsToTranslate.length)) {
            console.log(`📊 Progress: ${translated}/${questionsToTranslate.length} questions processed`);
        }
    }

    console.log(`\n📊 Questions Summary: ${translated} processed, ${failed} failed\n`);
}

async function runTranslations() {
    console.log('🌍 Starting Google Gemini Translation Service\n');
    console.log(`📋 Configuration:`);
    console.log(`   - Source Language: Italian (it)`);
    console.log(`   - Target Language: English (${TARGET_LANGUAGE})`);
    console.log(`   - Rate Limit: 10 requests/minute (${RATE_LIMIT_DELAY}ms delay)`);
    console.log(`   - Model: Google Gemini 2.0 Flash`);
    console.log(`   - Verbose Mode: ${VERBOSE ? 'ON (show every item)' : `OFF (show progress every ${PROGRESS_INTERVAL} items)`}\n`);

    try {
        await translateCategories();
        await translateQuestions();

        console.log('\n✅ Translation process completed!');
    } catch (error) {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    }
}

runTranslations();
