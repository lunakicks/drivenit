
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

async function testFullFlow() {
    console.log('Testing full auth and update flow...');

    // 1. Sign up a test user
    const email = `testuser${Date.now()}@gmail.com`;
    const password = 'password123';

    console.log(`Signing up user ${email}...`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                display_name: 'Initial Name'
            }
        }
    });

    if (authError) {
        console.error('Sign up failed:', authError);
        return;
    }

    const user = authData.user;
    if (!user) {
        console.error('No user returned after signup');
        return;
    }

    console.log('User signed up:', user.id);

    if (authData.session) {
        await supabase.auth.setSession(authData.session);
        console.log('Session explicitly set.');
    }

    // 2. Wait a bit for the trigger to create the profile
    console.log('Waiting for profile creation...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Check initial profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error('Error fetching profile:', profileError);
    } else {
        console.log('Initial profile:', profile);
    }

    // 4. Update display_name via RPC
    console.log('Updating display_name to "Updated Name" via RPC...');
    const { data: rpcData, error: rpcError } = await supabase
        .rpc('update_profile_display_name', { new_display_name: 'Updated Name' });

    if (rpcError) {
        console.error('RPC Update failed:', rpcError);
    } else {
        console.log('RPC call successful. Result:', rpcData);

        const { data: verifyData } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', user.id)
            .single();

        if (verifyData && verifyData.display_name === 'Updated Name') {
            console.log('SUCCESS: display_name was updated via RPC!');
        } else {
            console.log('FAILURE: RPC succeeded but data not updated?');
        }
    }
}

testFullFlow();
