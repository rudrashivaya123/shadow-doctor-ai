import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { TrialStatus } from "@/hooks/useTrialStatus";
import { supabase } from "@/integrations/supabase/client";

type SimulatedState = "trial" | "active" | "expired" | null;

interface TestingModeContextType {
  isTestingMode: boolean;
  isTestDuration: boolean;
  simulatedState: SimulatedState;
  setSimulatedState: (state: SimulatedState) => void;
  toggleTestingMode: () => void;
  toggleTestDuration: () => void;
  getOverriddenStatus: (real: TrialStatus) => TrialStatus;
  expireTrialNow: () => Promise<void>;
}

const TestingModeContext = createContext<TestingModeContextType | null>(null);

/** Test-duration trial = 2 minutes instead of 3 days */
const TEST_TRIAL_MS = 2 * 60 * 1000;

const buildSimulatedStatus = (state: SimulatedState): TrialStatus | null => {
  if (!state) return null;
  const now = new Date();

  if (state === "trial") {
    const start = now.toISOString();
    const end = new Date(now.getTime() + 3 * 86400000).toISOString();
    return {
      isTrialActive: true,
      daysRemaining: 3,
      isPremium: false,
      planStatus: "trial",
      startDate: start,
      expiryDate: end,
      loading: false,
    };
  }

  if (state === "active") {
    const start = new Date(now.getTime() - 5 * 86400000).toISOString();
    const end = new Date(now.getTime() + 25 * 86400000).toISOString();
    return {
      isTrialActive: false,
      daysRemaining: 25,
      isPremium: true,
      planStatus: "active",
      startDate: start,
      expiryDate: end,
      loading: false,
    };
  }

  // expired
  const start = new Date(now.getTime() - 31 * 86400000).toISOString();
  const end = new Date(now.getTime() - 1 * 86400000).toISOString();
  return {
    isTrialActive: false,
    daysRemaining: 0,
    isPremium: false,
    planStatus: "expired",
    startDate: start,
    expiryDate: end,
    loading: false,
  };
};

export const TEST_TRIAL_DURATION_MS = TEST_TRIAL_MS;

export const TestingModeProvider = ({ children }: { children: ReactNode }) => {
  const [isTestingMode, setIsTestingMode] = useState(false);
  const [isTestDuration, setIsTestDuration] = useState(false);
  const [simulatedState, setSimulatedState] = useState<SimulatedState>(null);

  const toggleTestingMode = useCallback(() => {
    setIsTestingMode((prev) => {
      if (prev) {
        setSimulatedState(null);
        setIsTestDuration(false);
      }
      return !prev;
    });
  }, []);

  const toggleTestDuration = useCallback(() => {
    setIsTestDuration((prev) => !prev);
  }, []);

  const getOverriddenStatus = useCallback(
    (real: TrialStatus): TrialStatus => {
      if (!isTestingMode || !simulatedState) return real;
      return buildSimulatedStatus(simulatedState) ?? real;
    },
    [isTestingMode, simulatedState]
  );

  const expireTrialNow = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const past = new Date(Date.now() - 60000).toISOString();

    // Use admin client via edge function to update subscription
    await supabase.functions.invoke("admin-data", {
      body: {
        action: "expire-trial",
        user_id: user.id,
        end_date: past,
      },
    });

    // Force page reload to reflect new status
    window.location.reload();
  }, []);

  return (
    <TestingModeContext.Provider
      value={{
        isTestingMode,
        isTestDuration,
        simulatedState,
        setSimulatedState,
        toggleTestingMode,
        toggleTestDuration,
        getOverriddenStatus,
        expireTrialNow,
      }}
    >
      {children}
    </TestingModeContext.Provider>
  );
};

export const useTestingMode = () => {
  const ctx = useContext(TestingModeContext);
  if (!ctx) throw new Error("useTestingMode must be used within TestingModeProvider");
  return ctx;
};
