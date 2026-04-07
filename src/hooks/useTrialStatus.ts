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

export const useTrialStatus = (): TrialStatus => {
  const { user } = useAuth();
  const { getOverriddenStatus } = useTestingMode();
  const [status, setStatus] = useState<TrialStatus>({
    isTrialActive: true,
    daysRemaining: 3,
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
        setStatus((s) => ({ ...s, loading: false }));
        return;
      }

      if (!data) {
        await supabase.from("subscriptions").insert({
          user_id: user.id,
          plan_status: "trial",
        });
        setStatus({
          isTrialActive: true,
          daysRemaining: 3,
          isPremium: false,
          planStatus: "trial",
          startDate: null,
          expiryDate: null,
          loading: false,
        });
        return;
      }

      const now = new Date();
      const endDate = new Date(data.subscription_end_date);
      const diffMs = endDate.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      let planStatus = data.plan_status as "trial" | "active" | "expired";
      if (diffMs <= 0) {
        planStatus = "expired";
      }

      const isPremium = planStatus === "active" && diffMs > 0;
      const isTrialActive = planStatus === "trial" && diffMs > 0;

      setStatus({
        isTrialActive,
        daysRemaining,
        isPremium,
        planStatus,
        startDate: data.subscription_start_date,
        expiryDate: data.subscription_end_date,
        loading: false,
      });
    };

    fetchSubscription();
  }, [user]);

  return getOverriddenStatus(status);
};

export const isFeatureLocked = (trial: TrialStatus): boolean => {
  return !trial.isPremium && !trial.isTrialActive;
};
