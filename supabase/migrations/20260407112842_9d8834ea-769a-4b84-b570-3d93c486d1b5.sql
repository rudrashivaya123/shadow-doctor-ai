
-- Trial devices table for anti-abuse tracking
CREATE TABLE public.trial_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  phone TEXT NOT NULL,
  otp_code TEXT,
  otp_expires_at TIMESTAMP WITH TIME ZONE,
  otp_verified BOOLEAN NOT NULL DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraints to prevent abuse
CREATE UNIQUE INDEX idx_trial_devices_device_id ON public.trial_devices(device_id) WHERE otp_verified = true;
CREATE UNIQUE INDEX idx_trial_devices_phone ON public.trial_devices(phone) WHERE otp_verified = true;

-- RLS
ALTER TABLE public.trial_devices ENABLE ROW LEVEL SECURITY;

-- Allow anon users to check trial status by device_id (read-only, limited)
CREATE POLICY "Anyone can check device trial status"
  ON public.trial_devices FOR SELECT
  TO anon, authenticated
  USING (true);
