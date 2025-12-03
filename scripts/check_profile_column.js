
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumn() {
    console.log('Checking profiles table structure...');

    // Try to select display_name from profiles
    const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .limit(1);

    if (error) {
        console.error('Error selecting display_name:', error);
        if (error.message.includes('does not exist') || error.code === 'PGRST301') {
            console.log('Column display_name likely does not exist.');
        }
    } else {
        console.log('Column display_name exists. Data sample:', data);
    }
}

checkColumn();
