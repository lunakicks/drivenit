import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file.');
    console.error('Please add SUPABASE_SERVICE_ROLE_KEY to your .env file to allow database writes.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const QUESTIONS_DIR = path.join(__dirname, '../questions');

async function importQuestions() {
    try {
        const files = fs.readdirSync(QUESTIONS_DIR).filter(file => file.endsWith('.csv'));

        if (files.length === 0) {
            console.log('No CSV files found in questions directory.');
            return;
        }

        console.log(`Found ${files.length} CSV files to process.`);

        for (const file of files) {
            await processFile(file);
        }

        console.log('Import process completed.');

    } catch (error) {
        console.error('Error during import:', error);
    }
}

async function processFile(filename) {
    console.log(`\nProcessing ${filename}...`);
    const filePath = path.join(QUESTIONS_DIR, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Calculate hash
    const fileHash = crypto.createHash('sha256').update(fileContent).digest('hex');

    // Slug from filename (remove extension)
    const slug = path.parse(filename).name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const title = path.parse(filename).name.replace(/-/g, ' '); // Simple title generation

    // Check if category exists and hash matches
    const { data: existingCategory, error: fetchError } = await supabase
        .from('categories')
        .select('id, import_hash')
        .eq('slug', slug)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "The result contains 0 rows"
        console.error(`Error fetching category ${slug}:`, fetchError.message);
        return;
    }

    if (existingCategory) {
        if (existingCategory.import_hash === fileHash) {
            console.log(`  Skipping ${filename} (no changes detected).`);
            return;
        }
        console.log(`  Updating category ${slug} (changes detected).`);
    } else {
        console.log(`  Creating new category ${slug}.`);
    }

    // Parse CSV
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    console.log(`  Found ${records.length} questions.`);

    // Upsert Category
    const { data: category, error: upsertError } = await supabase
        .from('categories')
        .upsert({
            slug: slug,
            title_it: title, // Using filename as title for now, user can update later
            import_hash: fileHash,
            icon_name: 'book-open' // Default icon
        }, { onConflict: 'slug' })
        .select()
        .single();

    if (upsertError) {
        console.error(`  Error upserting category ${slug}:`, upsertError.message);
        return;
    }

    const categoryId = category.id;

    // Prepare questions
    const questions = records.map(record => {
        // Map CSV columns to DB columns
        // CSV: ,Numero domanda,Testo domanda,Risposta Corretta,Immagine

        const questionText = record['Testo domanda'];
        const correctAnswer = record['Risposta Corretta']; // VERO / FALSO
        const imageUrl = record['Immagine'] || null; // Use null if empty, or a default URL if required

        let correctOptionIndex = 0;
        if (correctAnswer && correctAnswer.toUpperCase() === 'FALSO') {
            correctOptionIndex = 1;
        }

        return {
            category_id: categoryId,
            question_text_it: questionText,
            options_it: ['Vero', 'Falso'], // Standard options
            correct_option_index: correctOptionIndex,
            image_url: imageUrl,
            difficulty_level: 1
        };
    });

    // Delete existing questions for this category to avoid duplicates (simple strategy for now)
    // Alternatively, we could try to upsert based on question text, but that's risky.
    // Since we are treating the CSV as the source of truth for the section, replacing is safer.
    if (existingCategory) {
        const { error: deleteError } = await supabase
            .from('questions')
            .delete()
            .eq('category_id', categoryId);

        if (deleteError) {
            console.error(`  Error clearing old questions:`, deleteError.message);
            // Continue anyway? Maybe risky. Let's stop for this file.
            return;
        }
    }

    // Insert new questions
    const { error: insertError } = await supabase
        .from('questions')
        .insert(questions);

    if (insertError) {
        console.error(`  Error inserting questions:`, insertError.message);
    } else {
        console.log(`  Successfully imported ${questions.length} questions.`);
    }
}

importQuestions();
