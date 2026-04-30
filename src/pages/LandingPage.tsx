import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Activity, Crown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import TrialRegistrationModal from "@/components/TrialRegistrationModal";
import AppFooter from "@/components/AppFooter";
import LandingHero from "@/components/landing/LandingHero";
import LandingSocialProof from "@/components/landing/LandingSocialProof";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingTestimonials from "@/components/landing/LandingTestimonials";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingFAQ from "@/components/landing/LandingFAQ";
import { useAuth } from "@/hooks/useAuth";
import { useTrialStatus, isFeatureLocked } from "@/hooks/useTrialStatus";
import { useRazorpay } from "@/hooks/useRazorpay";
import { supabase } from "@/integrations/supabase/client";

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const trial = useTrialStatus();
  const { initiatePayment } = useRazorpay(() => navigate("/dashboard"));
  const [showTrialModal, setShowTrialModal] = useState(false);

  // Show upgrade prompt whenever a logged-in user's trial is expired,
  // OR when the explicit ?upgrade=1 param is present.
  const trialExpired = !!user && !trial.loading && isFeatureLocked(trial);
  const isUpgradeMode = trialExpired || (searchParams.get("upgrade") === "1" && !!user);

  // When a trial-expired user is bounced here, scroll to pricing immediately.
  useEffect(() => {
    if (isUpgradeMode) {
      setTimeout(() => {
        document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  }, [isUpgradeMode]);

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const openTrial = () => setShowTrialModal(true);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <nav className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4" aria-label="Main navigation">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">ShadowMD</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={scrollToPricing}>
              Pricing
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/support")}>
              Support
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate("/contact")}>
              Contact
            </Button>
            {user ? (
              <Button size="sm" variant="outline" onClick={handleSignOut} className="gap-1.5">
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => navigate("/auth")}>
                Login
              </Button>
            )}
          </div>
        </nav>
      </header>

      {/* Trial-expired banner */}
      {isUpgradeMode && (
        <div className="bg-destructive/10 border-b border-destructive/30">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground text-center sm:text-left">
              ⏰ Your free trial has ended. Upgrade to Pro to continue using ShadowMD.
            </p>
            <Button
              size="sm"
              className="gap-1.5 bg-success hover:bg-success/90 text-success-foreground font-semibold shrink-0"
              onClick={initiatePayment}
            >
              <Crown className="h-3.5 w-3.5" />
              Upgrade — ₹1,499/mo
            </Button>
          </div>
        </div>
      )}

      <main>
        <LandingHero onStartTrial={isUpgradeMode ? initiatePayment : openTrial} />
        <LandingSocialProof />
        <LandingFeatures />
        <LandingTestimonials />
        <LandingPricing onStartTrial={isUpgradeMode ? initiatePayment : openTrial} />
        <LandingFAQ />

        {/* Disclaimer */}
        <section className="py-6 px-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
            ⚕️ ShadowMD is an AI-assisted clinical decision support tool and is not a substitute for professional medical judgment.
            Always verify AI suggestions with clinical expertise. Not intended for emergency or life-threatening situations.
          </p>
        </section>
      </main>

      <AppFooter />

      <TrialRegistrationModal
        open={showTrialModal}
        onClose={() => setShowTrialModal(false)}
        onSuccess={() => {
          setShowTrialModal(false);
          navigate("/dashboard");
        }}
      />
    </div>
  );
};

export default LandingPage;
