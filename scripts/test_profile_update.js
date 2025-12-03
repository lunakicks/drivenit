
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

async function testUpdate() {
    console.log('Testing profile update...');

    // 1. Read a profile to get an ID
    const { data: profiles, error: readError } = await supabase
        .from('profiles')
        .select('id, display_name')
        .limit(1);

    if (readError) {
        console.error('Error reading profiles:', readError);
    } else {
        console.log('Successfully read profiles:', profiles);
        if (profiles.length > 0) {
            const userId = profiles[0].id;
            console.log(`Attempting to update profile for user ${userId}...`);

            // 2. Try to update
            const { data: updateData, error: updateError } = await supabase
                .from('profiles')
                .update({ display_name: 'Test Update' })
                .eq('id', userId)
                .select();

            if (updateError) {
                console.error('Update failed:', updateError);
            } else {
                console.log('Update call returned:', updateData);
                if (updateData && updateData.length > 0) {
                    console.log('Update confirmed! New display_name:', updateData[0].display_name);
                } else {
                    console.log('Update returned no data. Row might not have been updated (RLS blocking?).');
                }
            }
        }
    }
}

testUpdate();
