-- Add import_hash column to categories table to track CSV file versions
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS import_hash text;
