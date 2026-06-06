-- Force server-controlled start/end dates on trial subscription inserts from clients.
-- Service-role inserts/updates (used by edge functions for paid plans, renewals, etc.) bypass triggers? No — triggers always run.
-- So we only clamp when plan_status = 'trial' AND the row is being INSERTED.
CREATE OR REPLACE FUNCTION public.enforce_trial_subscription_dates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.plan_status = 'trial' THEN
    NEW.subscription_start_date := now();
    NEW.subscription_end_date := now() + interval '3 days';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_trial_subscription_dates ON public.subscriptions;
CREATE TRIGGER trg_enforce_trial_subscription_dates
BEFORE INSERT ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.enforce_trial_subscription_dates();