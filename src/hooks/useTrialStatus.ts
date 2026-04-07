import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTestingMode } from "@/contexts/TestingModeContext";

export interface TrialStatus {
  isTrialActive: boolean;
  daysRemaining: number;
  isPremium: boolean;
  planStatus: "trial" | "active" | "expired";
  startDate: string | null;
  expiryDate: string | null;
  loading: boolean;
}

const computeStatus = (data: {
  plan_status: string;
  subscription_start_date: string;
  subscription_end_date: string;
}): TrialStatus => {
  const now = new Date();
  const endDate = new Date(data.subscription_end_date);
  const diffMs = endDate.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const isExpired = diffMs <= 0;

  let planStatus = data.plan_status as "trial" | "active" | "expired";

  // Active paid subscription — always allow access (even past end date until explicitly cancelled)
  const isPremium = planStatus === "active";
  // Trial — allow access only if not expired
  const isTrialActive = planStatus === "trial" && !isExpired;

  // Only mark as expired for trials that have passed
  if (isExpired && planStatus === "trial") {
    planStatus = "expired";
  }

  return {
    isTrialActive,
    daysRemaining,
    isPremium,
    planStatus,
    startDate: data.subscription_start_date,
    expiryDate: data.subscription_end_date,
    loading: false,
  };
};

export const useTrialStatus = (): TrialStatus => {
  const { user } = useAuth();
  const { getOverriddenStatus } = useTestingMode();
  const [status, setStatus] = useState<TrialStatus>({
    isTrialActive: false,
    daysRemaining: 0,
    isPremium: false,
    planStatus: "trial",
    startDate: null,
    expiryDate: null,
    loading: true,
  });

  useEffect(() => {
    if (!user) return;

    const fetchSubscription = async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Subscription fetch error:", error);
        setStatus((s) => ({ ...s, loading: false }));
        return;
      }

      if (!data) {
        // No subscription row — create a new 3-day trial and re-fetch
        const { error: insertError } = await supabase.from("subscriptions").insert({
          user_id: user.id,
          plan_status: "trial",
        });

        if (insertError) {
          console.error("Subscription insert error:", insertError);
          setStatus((s) => ({ ...s, loading: false }));
          return;
        }

        // Re-fetch to get the DB-generated dates
        const { data: newData } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (newData) {
          setStatus(computeStatus(newData));
        } else {
          setStatus((s) => ({ ...s, loading: false }));
        }
        return;
      }

      setStatus(computeStatus(data));
    };

    fetchSubscription();
  }, [user]);

  return getOverriddenStatus(status);
};

export const isFeatureLocked = (trial: TrialStatus): boolean => {
  if (trial.loading) return false; // Don't lock while loading
  return !trial.isPremium && !trial.isTrialActive;
};
