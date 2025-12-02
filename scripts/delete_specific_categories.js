import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function deleteSpecificCategories() {
    console.log('Starting cleanup process...');

    // 1. Find categories to delete
    const { data: categories, error: fetchError } = await supabase
        .from('categories')
        .select('id, title_it')
        .or('title_it.ilike.QuestionsB 590 594%,title_it.ilike.DomandeB 590 594%');

    if (fetchError) {
        console.error('❌ Error fetching categories:', fetchError);
        return;
    }

    if (!categories || categories.length === 0) {
        console.log('✓ No matching categories found to delete.');
        return;
    }

    console.log(`Found ${categories.length} categories to delete:`);
    categories.forEach(cat => console.log(`- ${cat.title_it} (${cat.id})`));

    const categoryIds = categories.map(cat => cat.id);

    // 2. Find questions associated with these categories to get their IDs
    console.log(`\nFetching questions for ${categoryIds.length} categories...`);
    const { data: questions, error: fetchQuestionsError } = await supabase
        .from('questions')
        .select('id')
        .in('category_id', categoryIds);

    if (fetchQuestionsError) {
        console.error('❌ Error fetching questions:', fetchQuestionsError);
        return;
    }

    const questionIds = questions.map(q => q.id);
    console.log(`Found ${questionIds.length} questions.`);

    if (questionIds.length > 0) {
        // 3. Delete dependent records for these questions

        // 3a. Translations
        console.log(`\nDeleting translations...`);
        const { error: deleteTranslationsError } = await supabase
            .from('translations')
            .delete({ count: 'exact' })
            .in('question_id', questionIds);
        if (deleteTranslationsError) console.error('❌ Error deleting translations:', deleteTranslationsError);

        // 3b. User Progress
        console.log(`Deleting user_progress...`);
        const { error: deleteProgressError } = await supabase
            .from('user_progress')
            .delete({ count: 'exact' })
            .in('question_id', questionIds);
        if (deleteProgressError) console.error('❌ Error deleting user_progress:', deleteProgressError);

        // 3c. Bookmarks
        console.log(`Deleting bookmarks...`);
        const { error: deleteBookmarksError } = await supabase
            .from('bookmarks')
            .delete({ count: 'exact' })
            .in('question_id', questionIds);
        if (deleteBookmarksError) console.error('❌ Error deleting bookmarks:', deleteBookmarksError);

        // 3d. Flags
        console.log(`Deleting flags...`);
        const { error: deleteFlagsError } = await supabase
            .from('flags')
            .delete({ count: 'exact' })
            .in('question_id', questionIds);
        if (deleteFlagsError) console.error('❌ Error deleting flags:', deleteFlagsError);


        // 4. Delete questions
        console.log(`\nDeleting ${questionIds.length} questions...`);
        const { error: deleteQuestionsError, count: deletedQuestionsCount } = await supabase
            .from('questions')
            .delete({ count: 'exact' })
            .in('id', questionIds);

        if (deleteQuestionsError) {
            console.error('❌ Error deleting questions:', deleteQuestionsError);
            return;
        }
        console.log(`✓ Deleted questions (count: ${deletedQuestionsCount !== null ? deletedQuestionsCount : 'unknown'})`);
    } else {
        console.log('✓ No questions found to delete.');
    }

    // 5. Delete the categories themselves
    console.log(`\nDeleting ${categoryIds.length} categories...`);
    const { error: deleteCategoriesError, count: deletedCategoriesCount } = await supabase
        .from('categories')
        .delete({ count: 'exact' })
        .in('id', categoryIds);

    if (deleteCategoriesError) {
        console.error('❌ Error deleting categories:', deleteCategoriesError);
        return;
    }

    console.log(`✓ Deleted ${deletedCategoriesCount !== null ? deletedCategoriesCount : categoryIds.length} categories.`);
    console.log('\n✅ Cleanup completed successfully.');
}

deleteSpecificCategories();
