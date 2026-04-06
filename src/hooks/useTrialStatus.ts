import { useState } from "react";

export interface TrialStatus {
  isTrialActive: boolean;
  daysRemaining: number;
  isPremium: boolean;
}

export const useTrialStatus = (): TrialStatus => {
  // TODO: Replace with actual subscription check from database
  const [status] = useState<TrialStatus>({
    isTrialActive: true,
    daysRemaining: 3,
    isPremium: false,
  });

  return status;
};

export const isFeatureLocked = (trial: TrialStatus): boolean => {
  return !trial.isPremium && !trial.isTrialActive;
};
