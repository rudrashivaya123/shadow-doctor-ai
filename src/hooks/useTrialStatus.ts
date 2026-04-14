import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  const isPremium = planStatus === "active";
  const isTrialActive = planStatus === "trial" && !isExpired;

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
  const [status, setStatus] = useState<TrialStatus>({
    isTrialActive: false,
    daysRemaining: 0,
    isPremium: false,
    planStatus: "trial",
    startDate: null,
    expiryDate: null,
    loading: true,
  });

  const fetchSubscription = useCallback(async () => {
    if (!user) return;

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
      const { error: insertError } = await supabase.from("subscriptions").insert({
        user_id: user.id,
        plan_status: "trial",
      });

      if (insertError) {
        console.error("Subscription insert error:", insertError);
        setStatus((s) => ({ ...s, loading: false }));
        return;
      }

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
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  // Auto-refresh every 30 seconds when trial is active
  useEffect(() => {
    if (!status.isTrialActive) return;
    const interval = setInterval(fetchSubscription, 30000);
    return () => clearInterval(interval);
  }, [status.isTrialActive, fetchSubscription]);

  // Recheck on network reconnect
  useEffect(() => {
    const handleOnline = () => {
      fetchSubscription();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [fetchSubscription]);

  // Recheck on visibility change (tab focus)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchSubscription();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [fetchSubscription]);

  return status;
};

export const isFeatureLocked = (trial: TrialStatus): boolean => {
  if (trial.loading) return false;
  return !trial.isPremium && !trial.isTrialActive;
};
