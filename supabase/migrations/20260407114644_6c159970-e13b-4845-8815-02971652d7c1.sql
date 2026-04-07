ALTER TABLE public.trial_devices ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.trial_devices ADD COLUMN IF NOT EXISTS paid boolean NOT NULL DEFAULT false;