import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import TrialRegistrationModal from "@/components/TrialRegistrationModal";
import AppFooter from "@/components/AppFooter";
import LandingHero from "@/components/landing/LandingHero";
import LandingSocialProof from "@/components/landing/LandingSocialProof";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingTestimonials from "@/components/landing/LandingTestimonials";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingFAQ from "@/components/landing/LandingFAQ";

const LandingPage = () => {
  const navigate = useNavigate();
  const [showTrialModal, setShowTrialModal] = useState(false);

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const openTrial = () => setShowTrialModal(true);

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
            <Button size="sm" variant="outline" onClick={() => navigate("/auth")}>
              Login
            </Button>
          </div>
        </nav>
      </header>

      <main>
        <LandingHero onStartTrial={openTrial} />
        <LandingSocialProof />
        <LandingFeatures />
        <LandingTestimonials />
        <LandingPricing onStartTrial={openTrial} />
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
