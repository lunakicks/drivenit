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

async function checkCategories() {
    console.log('Checking for categories...');

    // Check for 'QuestionsB%'
    const { data: questionsB, error: error1 } = await supabase
        .from('categories')
        .select('id, title_it, slug')
        .ilike('title_it', 'QuestionsB%');

    if (error1) console.error('Error fetching QuestionsB:', error1);
    else {
        console.log(`Found ${questionsB.length} categories starting with 'QuestionsB':`);
        questionsB.forEach(cat => console.log(`- ${cat.title_it} (${cat.id})`));
    }

    // Check for 'DomandeB%'
    const { data: domandeB, error: error2 } = await supabase
        .from('categories')
        .select('id, title_it, slug')
        .ilike('title_it', 'DomandeB%');

    if (error2) console.error('Error fetching DomandeB:', error2);
    else {
        console.log(`Found ${domandeB.length} categories starting with 'DomandeB':`);
        domandeB.forEach(cat => console.log(`- ${cat.title_it} (${cat.id})`));
    }
}

checkCategories();
