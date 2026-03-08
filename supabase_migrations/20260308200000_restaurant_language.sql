-- Add language column to restaurants table
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS "language" TEXT DEFAULT 'en' CHECK ("language" IN ('en', 'es'));

-- Update existing restaurants to 'es' if you prefer a different default for existing ones, 
-- but the user asked for default English for the system.
