-- Add display_name column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name text;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.display_name IS 'User-editable display name shown in the app';
