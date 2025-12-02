import fs from 'fs';
import path from 'path';
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
const IMAGE_BASE_URL = process.env.VITE_IMAGE_BASE_URL || '/images/questions';

/**
 * Main import function - incremental import from page 10 onwards
 * @param {string} mappingFilePath - Path to the JSON mapping file
 * @param {number} startPage - Page number to start from (default: 10)
 */
async function importQuestionsIncremental(mappingFilePath, startPage = 10) {
    try {
        // Read and parse the JSON mapping file
        const mappingContent = fs.readFileSync(mappingFilePath, 'utf-8');
        const mapping = JSON.parse(mappingContent);

        console.log(`Found ${mapping.length} total entries in mapping.`);

        // Filter entries from startPage onwards
        const filteredMapping = mapping.filter(entry => entry.page_number >= startPage);
        console.log(`Filtered to ${filteredMapping.length} entries from page ${startPage} onwards.`);

        if (filteredMapping.length === 0) {
            console.log('No entries to process. Exiting.');
            return;
        }

        // Group by section (category)
        const categoriesMap = new Map();

        for (const entry of filteredMapping) {
            const { section, table_name, page_number } = entry;

            if (!categoriesMap.has(section)) {
                categoriesMap.set(section, []);
            }
            categoriesMap.get(section).push({ table_name, page_number });
        }

        console.log(`\nFound ${categoriesMap.size} unique categories to process:`);
        for (const [category, files] of categoriesMap.entries()) {
            console.log(`  - ${category}: ${files.length} file(s)`);
        }

        // Process each category
        let totalAdded = 0;
        let totalSkipped = 0;

        for (const [categoryName, tableInfo] of categoriesMap.entries()) {
            const result = await processCategoryIncremental(categoryName, tableInfo);
            totalAdded += result.added;
            totalSkipped += result.skipped;
        }

        console.log('\n✅ Incremental import completed successfully.');
        console.log(`   📊 Total questions added: ${totalAdded}`);
        console.log(`   ⏭️  Total questions skipped (already exist): ${totalSkipped}`);

    } catch (error) {
        console.error('❌ Error during import:', error);
        process.exit(1);
    }
}

/**
 * Process a single category incrementally - only add new questions
 */
async function processCategoryIncremental(categoryName, tableInfo) {
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
            icon_name: getIconForCategory(categoryName),
            order_index: 0
        }, { onConflict: 'slug' })
        .select()
        .single();

    if (categoryError) {
        console.error(`  ❌ Error upserting category ${slug}:`, categoryError.message);
        return { added: 0, skipped: 0 };
    }

    const categoryId = category.id;
    console.log(`  ✓ Category ready: ${categoryName} (ID: ${categoryId})`);

    // Fetch existing questions for this category
    const { data: existingQuestions, error: fetchError } = await supabase
        .from('questions')
        .select('question_text_it')
        .eq('category_id', categoryId);

    if (fetchError) {
        console.error(`  ❌ Error fetching existing questions:`, fetchError.message);
        return { added: 0, skipped: 0 };
    }

    // Create a Set of existing question texts for fast lookup
    const existingTexts = new Set(existingQuestions.map(q => q.question_text_it?.trim()));
    console.log(`  📋 Found ${existingTexts.size} existing questions in this category`);

    // Collect all questions from all files for this category
    const allQuestions = [];

    for (const { table_name, page_number } of tableInfo) {
        // Convert table_name to CSV file path
        // scratch_pymupdf/DomandeB-table9.parquet -> DomandeB-table9.csv
        const csvFileName = table_name.replace('scratch_pymupdf/', '').replace('.parquet', '.csv');
        const filePath = path.join(QUESTIONS_DIR, csvFileName);

        if (!fs.existsSync(filePath)) {
            console.warn(`  ⚠️  File not found (page ${page_number}): ${filePath}`);
            continue;
        }

        console.log(`  📄 Reading ${csvFileName} (page ${page_number})...`);
        const questions = await parseQuestionFile(filePath, categoryId);
        allQuestions.push(...questions);
    }

    if (allQuestions.length === 0) {
        console.log(`  ⚠️  No questions found for category ${categoryName}`);
        return { added: 0, skipped: 0 };
    }

    // Filter out questions that already exist
    const newQuestions = allQuestions.filter(q => {
        const text = q.question_text_it?.trim();
        return text && !existingTexts.has(text);
    });

    const skippedCount = allQuestions.length - newQuestions.length;

    console.log(`  📊 Questions breakdown:`);
    console.log(`     Total parsed: ${allQuestions.length}`);
    console.log(`     New questions: ${newQuestions.length}`);
    console.log(`     Already exist: ${skippedCount}`);

    if (newQuestions.length === 0) {
        console.log(`  ✓ No new questions to add (all already exist)`);
        return { added: 0, skipped: skippedCount };
    }

    // Insert new questions only
    const { error: insertError } = await supabase
        .from('questions')
        .insert(newQuestions);

    if (insertError) {
        console.error(`  ❌ Error inserting questions:`, insertError.message);
        return { added: 0, skipped: skippedCount };
    } else {
        console.log(`  ✅ Successfully added ${newQuestions.length} new questions`);
        return { added: newQuestions.length, skipped: skippedCount };
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
        // Handle the column structure
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
    if (name.includes('semaforiche') || name.includes('agenti')) return 'traffic-cone';
    if (name.includes('orizzontale')) return 'minus';

    return 'book-open'; // Default icon
}

// Get mapping file path and start page from command line
const mappingFilePath = process.argv[2] || path.join(QUESTIONS_DIR, 'clean_tables_metadata_final.json');
const startPage = parseInt(process.argv[3]) || 10;

if (!fs.existsSync(mappingFilePath)) {
    console.error(`❌ Mapping file not found: ${mappingFilePath}`);
    console.error('Usage: node scripts/import_questions_incremental.js [path/to/mapping.json] [startPage]');
    console.error('Example: node scripts/import_questions_incremental.js questions/clean_tables_metadata_final.json 10');
    process.exit(1);
}

console.log(`📋 Using mapping file: ${mappingFilePath}`);
console.log(`📄 Starting from page: ${startPage}\n`);
importQuestionsIncremental(mappingFilePath, startPage);
