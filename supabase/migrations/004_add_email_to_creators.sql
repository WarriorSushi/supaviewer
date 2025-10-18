-- Add email column to creators table
-- This allows storing email for creators who may not be registered users

ALTER TABLE public.creators
ADD COLUMN IF NOT EXISTS email TEXT;

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_creators_email ON public.creators(email);

-- Add comment
COMMENT ON COLUMN public.creators.email IS 'Creator email address - may differ from auth.users email if creator is not a registered user';
