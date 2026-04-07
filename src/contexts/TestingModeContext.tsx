import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { TrialStatus } from "@/hooks/useTrialStatus";

type SimulatedState = "trial" | "active" | "expired" | null;

interface TestingModeContextType {
  isTestingMode: boolean;
  simulatedState: SimulatedState;
  setSimulatedState: (state: SimulatedState) => void;
  toggleTestingMode: () => void;
  getOverriddenStatus: (real: TrialStatus) => TrialStatus;
}

const TestingModeContext = createContext<TestingModeContextType | null>(null);

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

export const TestingModeProvider = ({ children }: { children: ReactNode }) => {
  const [isTestingMode, setIsTestingMode] = useState(false);
  const [simulatedState, setSimulatedState] = useState<SimulatedState>(null);

  const toggleTestingMode = useCallback(() => {
    setIsTestingMode((prev) => {
      if (prev) setSimulatedState(null);
      return !prev;
    });
  }, []);

  const getOverriddenStatus = useCallback(
    (real: TrialStatus): TrialStatus => {
      if (!isTestingMode || !simulatedState) return real;
      return buildSimulatedStatus(simulatedState) ?? real;
    },
    [isTestingMode, simulatedState]
  );

  return (
    <TestingModeContext.Provider
      value={{ isTestingMode, simulatedState, setSimulatedState, toggleTestingMode, getOverriddenStatus }}
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
