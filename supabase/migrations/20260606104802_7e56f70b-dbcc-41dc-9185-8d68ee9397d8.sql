-- Replace overly permissive SELECT policy on trial_devices
DROP POLICY IF EXISTS "Anyone can check device trial status" ON public.trial_devices;

CREATE POLICY "Users can view their own trial device"
ON public.trial_devices
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);