import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const DEMO_KEY = "shadowmd_demo_user";

// Fake user object for demo sessions
const DEMO_USER: User = {
  id: "demo-user-id",
  email: "demo@shadowmd.com",
  aud: "authenticated",
  role: "authenticated",
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: { is_demo: true },
} as User;

export const isDemoSession = (): boolean =>
  localStorage.getItem(DEMO_KEY) === "true";

export const startDemoSession = () =>
  localStorage.setItem(DEMO_KEY, "true");

export const endDemoSession = () =>
  localStorage.removeItem(DEMO_KEY);

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check demo session first
    if (isDemoSession()) {
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isDemoSession()) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    if (isDemoSession()) {
      endDemoSession();
      setUser(null);
      window.location.href = "/";
      return;
    }
    await supabase.auth.signOut();
  }, []);

  return { user, loading, signOut, isDemoUser: isDemoSession() };
};
