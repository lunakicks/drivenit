# Question Import Guide

## Using Supabase Storage for Images

### Step 1: Configure Environment

Add this to your `.env` file (replace with your actual Supabase URL):

```env
VITE_IMAGE_BASE_URL=https://YOUR_PROJECT.supabase.co/storage/v1/object/public/question-images
```

### Step 2: Upload Images

1. **Place your images** in `questions/images/` folder
2. **Run the upload script**:

```bash
node scripts/upload_images.js
```

The script will:
- Upload all images from `questions/images/` to your Supabase bucket
- Skip images that already exist
- Show you the public URL for verification

### Step 3: Import Questions

After uploading images, run the import script as normal. The image URLs will automatically point to your Supabase Storage bucket.

---

## Using the Enhanced Import Script



The new import script (`import_questions_with_mapping.js`) uses a JSON mapping file to organize questions by category.

### Setup

1. **Place your CSV files** in the `questions/` folder
2. **Create a mapping.json** file in the `questions/` folder with this structure:

```json
[
    {
        "page_number": 1,
        "section": "Segnali di indicazione",
        "table_name": "DomandeB-1-10-table1.csv"
    },
    {
        "page_number": 2,
        "section": "Segnali di indicazione",
        "table_name": "DomandeB-1-10-table2.csv"
    }
]
```

3. **Configure image URL** (optional): Add to your `.env` file:
```env
VITE_IMAGE_BASE_URL=https://your-cdn.com/images/questions
# Or leave it as default: /images/questions
```

### CSV Format

Your CSV files should have these columns:
```csv
"Numero domanda",Testo domanda,Risposta Corretta,Immagine,image_files
21819,Question text here,VERO,,['image.png']
```

- **image_files**: Array format like `['image1.png', 'image2.png']` or `['image.png']`
- The script will use the first image if multiple are provided

### Running the Import

```bash
# Using default mapping file (questions/mapping.json)
node scripts/import_questions_with_mapping.js

# Using a custom mapping file
node scripts/import_questions_with_mapping.js path/to/custom-mapping.json
```

### What the Script Does

1. **Reads the JSON mapping** to find all CSV files and their categories
2. **Groups by section** (category name from JSON)
3. **Creates/updates categories** in Supabase using the `section` value
4. **Parses CSV files** and extracts:
   - Question text
   - Correct answer (VERO/FALSO)
   - Image files (from the `image_files` column)
5. **Assigns icons** automatically based on category name keywords
6. **Imports all questions** for each category

### Category Icons

The script automatically assigns icons based on keywords in the category name:
- "segnali...indicazione" → `signpost`
- "segnali...obbligo" → `circle-slash`
- "pannelli" → `square`
- "divieto" → `ban`
- "pericolo" → `alert-triangle`
- Default → `book-open`

You can customize these later in the Supabase dashboard.

### Image Handling

Images are referenced using the pattern: `{IMAGE_BASE_URL}/{filename}`

Make sure your images are accessible at the configured base URL. The script parses the `image_files` column which can be:
- `['image.png']` → extracts `image.png`
- `['img1.png', 'img2.png']` → uses `img1.png` (first one)
- Empty → no image for that question
