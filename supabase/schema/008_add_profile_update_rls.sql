-- Ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing update policy if it exists (to recreate it)
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;

-- Create policy: Users can only update their own profile
CREATE POLICY "Users can update own profile."
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Verify all policies on profiles table
-- SELECT: Anyone can view profiles
-- INSERT: Users can insert their own profile (handled by trigger on signup)
-- UPDATE: Users can only update their own profile (this policy)
-- DELETE: Not allowed (you may want to add this if needed)
