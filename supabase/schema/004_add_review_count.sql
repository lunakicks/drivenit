-- Add review_count column to user_progress table
-- This tracks how many times a user has correctly answered a previously incorrect question
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.user_progress.review_count IS 'Number of times user has correctly reviewed this question after initially getting it wrong. Resets to 0 when status changes to incorrect.';
