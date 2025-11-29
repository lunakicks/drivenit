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
const IMAGE_BASE_URL = process.env.VITE_IMAGE_BASE_URL || '/images/questions'; // Configure as needed

/**
 * Main import function using JSON mapping
 * @param {string} mappingFilePath - Path to the JSON mapping file
 */
async function importQuestionsFromMapping(mappingFilePath) {
    try {
        // Read and parse the JSON mapping file
        const mappingContent = fs.readFileSync(mappingFilePath, 'utf-8');
        const mapping = JSON.parse(mappingContent);

        console.log(`Found ${mapping.length} files to process in mapping.`);

        // Group by section (category)
        const categoriesMap = new Map();

        for (const entry of mapping) {
            const { section, table_name } = entry;

            if (!categoriesMap.has(section)) {
                categoriesMap.set(section, []);
            }
            categoriesMap.get(section).push(table_name);
        }

        console.log(`\nFound ${categoriesMap.size} unique categories:`);
        for (const [category, files] of categoriesMap.entries()) {
            console.log(`  - ${category}: ${files.length} file(s)`);
        }

        // Process each category
        for (const [categoryName, tableNames] of categoriesMap.entries()) {
            await processCategory(categoryName, tableNames);
        }

        console.log('\n✅ Import process completed successfully.');

    } catch (error) {
        console.error('❌ Error during import:', error);
        process.exit(1);
    }
}

/**
 * Process a single category with its associated files
 */
async function processCategory(categoryName, tableNames) {
    console.log(`\n📦 Processing category: ${categoryName}`);

    // Create slug from category name
    const slug = categoryName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    // Upsert category
    const { data: category, error: categoryError } = await supabase
        .from('categories')
        .upsert({
            slug: slug,
            title_it: categoryName,
            icon_name: getIconForCategory(categoryName), // Helper function for icons
            order_index: 0 // You can customize this
        }, { onConflict: 'slug' })
        .select()
        .single();

    if (categoryError) {
        console.error(`  ❌ Error upserting category ${slug}:`, categoryError.message);
        return;
    }

    const categoryId = category.id;
    console.log(`  ✓ Category ready: ${categoryName} (${slug})`);

    // Collect all questions from all files for this category
    const allQuestions = [];

    for (const tableName of tableNames) {
        const filePath = path.join(QUESTIONS_DIR, tableName.replace('scratch_pymupdf/', '').replace('.parquet', '.csv'));

        if (!fs.existsSync(filePath)) {
            console.warn(`  ⚠️  File not found: ${filePath}`);
            continue;
        }

        console.log(`  📄 Reading ${path.basename(filePath)}...`);
        const questions = await parseQuestionFile(filePath, categoryId);
        allQuestions.push(...questions);
    }

    if (allQuestions.length === 0) {
        console.log(`  ⚠️  No questions found for category ${categoryName}`);
        return;
    }

    // Delete existing questions for this category
    const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .eq('category_id', categoryId);

    if (deleteError) {
        console.error(`  ❌ Error clearing old questions:`, deleteError.message);
        return;
    }

    // Insert new questions
    const { error: insertError } = await supabase
        .from('questions')
        .insert(allQuestions);

    if (insertError) {
        console.error(`  ❌ Error inserting questions:`, insertError.message);
    } else {
        console.log(`  ✅ Successfully imported ${allQuestions.length} questions`);
    }
}

/**
 * Parse a single CSV file and return questions array
 */
async function parseQuestionFile(filePath, categoryId) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
        relax_column_count: true
    });

    const questions = records.map(record => {
        // Handle the new column structure
        const questionText = record['Testo domanda'];
        const correctAnswer = record['Risposta Corretta'];
        const imageFiles = record['image_files'] || record['Immagine'] || '';

        // Parse image_files if it's in array format like "['image.png']"
        let imageUrl = null;
        if (imageFiles && imageFiles.trim()) {
            try {
                // Remove brackets and quotes, get first image
                const cleanedFiles = imageFiles
                    .replace(/^\[|\]$/g, '')
                    .replace(/['"]/g, '')
                    .split(',')
                    .map(f => f.trim())
                    .filter(f => f.length > 0);

                if (cleanedFiles.length > 0) {
                    imageUrl = `${IMAGE_BASE_URL}/${cleanedFiles[0]}`;
                }
            } catch (e) {
                console.warn(`    ⚠️  Failed to parse image_files: ${imageFiles}`);
            }
        }

        // Determine correct option index
        let correctOptionIndex = 0;
        if (correctAnswer && correctAnswer.toUpperCase() === 'FALSO') {
            correctOptionIndex = 1;
        }

        return {
            category_id: categoryId,
            question_text_it: questionText,
            options_it: ['Vero', 'Falso'],
            correct_option_index: correctOptionIndex,
            image_url: imageUrl,
            difficulty_level: 1
        };
    }).filter(q => q.question_text_it && q.question_text_it.trim()); // Filter out empty questions

    return questions;
}

/**
 * Helper function to assign icons based on category name
 */
function getIconForCategory(categoryName) {
    const name = categoryName.toLowerCase();

    if (name.includes('segnali') && name.includes('indicazione')) return 'signpost';
    if (name.includes('segnali') && name.includes('obbligo')) return 'circle-slash';
    if (name.includes('pannelli')) return 'square';
    if (name.includes('divieto')) return 'ban';
    if (name.includes('pericolo')) return 'alert-triangle';
    if (name.includes('precedenza')) return 'chevrons-right';

    return 'book-open'; // Default icon
}

// Get mapping file path from command line or use default
const mappingFilePath = process.argv[2] || path.join(QUESTIONS_DIR, 'mapping.json');

if (!fs.existsSync(mappingFilePath)) {
    console.error(`❌ Mapping file not found: ${mappingFilePath}`);
    console.error('Usage: node scripts/import_questions_with_mapping.js [path/to/mapping.json]');
    process.exit(1);
}

console.log(`📋 Using mapping file: ${mappingFilePath}\n`);
importQuestionsFromMapping(mappingFilePath);
