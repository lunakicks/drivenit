import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const BUCKET_NAME = 'question-images';
const IMAGES_DIR = path.join(__dirname, '../questions/images'); // Adjust path as needed

/**
 * Upload all images from a directory to Supabase Storage
 */
async function uploadImages() {
    try {
        // Check if directory exists
        if (!fs.existsSync(IMAGES_DIR)) {
            console.error(`❌ Images directory not found: ${IMAGES_DIR}`);
            console.log('Please create the directory and place your images there.');
            process.exit(1);
        }

        // Get all image files
        const files = fs.readdirSync(IMAGES_DIR).filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext);
        });

        if (files.length === 0) {
            console.log('⚠️  No image files found in', IMAGES_DIR);
            return;
        }

        console.log(`📸 Found ${files.length} images to upload\n`);

        let uploaded = 0;
        let skipped = 0;
        let failed = 0;

        for (const filename of files) {
            const filePath = path.join(IMAGES_DIR, filename);
            const fileBuffer = fs.readFileSync(filePath);

            // Check if file already exists
            const { data: existingFile } = await supabase.storage
                .from(BUCKET_NAME)
                .list('', { search: filename });

            if (existingFile && existingFile.length > 0) {
                console.log(`⏭️  Skipped: ${filename} (already exists)`);
                skipped++;
                continue;
            }

            // Upload file
            const { data, error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filename, fileBuffer, {
                    contentType: `image/${path.extname(filename).substring(1)}`,
                    upsert: false
                });

            if (error) {
                console.error(`❌ Failed: ${filename} - ${error.message}`);
                failed++;
            } else {
                console.log(`✅ Uploaded: ${filename}`);
                uploaded++;
            }
        }

        console.log(`\n📊 Upload Summary:`);
        console.log(`   ✅ Uploaded: ${uploaded}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📁 Total: ${files.length}`);

        if (uploaded > 0) {
            const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}`;
            console.log(`\n🌐 Images are now accessible at:`);
            console.log(`   ${publicUrl}/{filename}`);
            console.log(`\n💡 Add this to your .env file:`);
            console.log(`   VITE_IMAGE_BASE_URL=${publicUrl}`);
        }

    } catch (error) {
        console.error('❌ Error during upload:', error);
        process.exit(1);
    }
}

uploadImages();
