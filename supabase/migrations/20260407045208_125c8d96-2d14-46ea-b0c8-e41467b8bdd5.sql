
-- Fix 1: Remove INSERT policy on payments (only service role via edge function should insert)
DROP POLICY "Service role can insert payments" ON public.payments;

-- Remove dangerous default on status column
ALTER TABLE public.payments ALTER COLUMN status DROP DEFAULT;

-- Fix 2: Remove unrestricted UPDATE policy on subscriptions
DROP POLICY "Users can update own subscription" ON public.subscriptions;

-- Replace INSERT policy to only allow trial status creation
DROP POLICY "Users can insert own subscription" ON public.subscriptions;
CREATE POLICY "Users can create trial subscription"
  ON public.subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND plan_status = 'trial'
  );
