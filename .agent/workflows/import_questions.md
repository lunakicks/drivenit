---
description: Import questions from CSV files into Supabase
---

This workflow describes how to import questions from CSV files in the `questions` directory into the Supabase database.

## Prerequisites

1.  **Supabase Service Role Key**: Ensure you have the `SUPABASE_SERVICE_ROLE_KEY` in your `.env` file.
    ```env
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
    ```
    *Note: You can find this key in your Supabase Project Settings > API.*

2.  **Database Schema**: Ensure the `import_hash` column exists in the `categories` table.
    ```sql
    ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS import_hash text;
    ```

## Steps

1.  **Place CSV Files**: Ensure your CSV files are in the `questions` directory.

2.  **Run Import Script**: Run the Node.js import script.
    ```bash
    node scripts/import_questions.js
    ```

    The script will:
    - Scan the `questions` directory.
    - Compare file hashes to skip unchanged files.
    - Create/Update categories.
    - Import questions.

## Verification

Check your Supabase dashboard to verify that new categories and questions have been added.
