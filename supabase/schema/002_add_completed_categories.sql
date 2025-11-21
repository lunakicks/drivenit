-- Add completed_categories column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS completed_categories text[] DEFAULT '{}';

-- Update RLS policies if necessary (existing policies should cover update on own profile)
-- "Users can update own profile." policy already exists.
