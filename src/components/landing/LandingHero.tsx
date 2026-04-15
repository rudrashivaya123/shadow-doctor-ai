import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingHeroProps {
  onStartTrial: () => void;
}

const LandingHero = ({ onStartTrial }: LandingHeroProps) => (
  <section className="relative py-20 md:py-32 px-4 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
    <div className="max-w-3xl mx-auto text-center space-y-6 relative">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium">
        <Zap className="h-3.5 w-3.5" />
        India's #1 AI Clinical Decision Support Tool
      </div>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight">
        Your AI-Powered{" "}
        <span className="text-primary">Diagnosis Assistant</span>{" "}
        for Smarter Clinical Decisions
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        Get instant differential diagnosis from symptoms, AI-powered radiology image analysis, and structured clinical reports — trusted by 500+ doctors across India.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        <Button
          size="lg"
          className="gap-2 bg-success hover:bg-success/90 text-success-foreground h-12 px-8 text-base font-semibold shadow-lg shadow-success/20"
          onClick={onStartTrial}
        >
          Start 3-Day Free Trial — No Payment Required <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground pt-2">
        No credit card needed • Full access for 3 days • Used by doctors in 50+ Indian cities
      </p>
    </div>
  </section>
);

export default LandingHero;
