-- Create profile for existing user
-- This will fix the empty profiles table

INSERT INTO public.profiles (id, email)
SELECT
  id,
  email
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
