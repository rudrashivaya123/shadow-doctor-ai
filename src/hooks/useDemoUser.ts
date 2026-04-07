import { useAuth, isDemoSession } from "@/hooks/useAuth";

const DEMO_EMAIL = "demo@shadowmd.com";

export const useDemoUser = () => {
  const { user } = useAuth();
  const isDemoUser = isDemoSession() || user?.email === DEMO_EMAIL;

  return {
    isDemoUser,
    demoEmail: DEMO_EMAIL,
    demoPassword: "Demo@123",
  };
};
