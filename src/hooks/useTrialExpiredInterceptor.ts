import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

/**
 * Listens for TRIAL_EXPIRED errors from edge functions.
 * When detected, forces navigation to the trial-expired screen.
 *
 * Works by monkey-patching fetch to intercept 403 + TRIAL_EXPIRED responses.
 * This is a global guard — impossible to bypass from the client.
 */
export const useTrialExpiredInterceptor = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      // Only intercept our Supabase function calls
      const url = typeof args[0] === "string" ? args[0] : (args[0] as Request)?.url || "";
      const isEdgeFunction = url.includes("/functions/v1/");

      if (isEdgeFunction && response.status === 403) {
        try {
          const cloned = response.clone();
          const body = await cloned.json();
          if (body?.code === "TRIAL_EXPIRED") {
            toast.error("Your 3-day free trial has ended. Please upgrade to continue.");
            // Navigate to dashboard which will show TrialExpired
            navigate("/dashboard", { replace: true });
          }
        } catch {
          // ignore parse errors
        }
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [navigate]);
};
