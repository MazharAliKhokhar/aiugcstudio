-- Add subscription tracking fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS variant_id TEXT;
