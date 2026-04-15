import { CheckCircle, Shield, Lock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const pricingFeatures = [
  "Unlimited AI consultations",
  "Radiology AI image analysis (X-ray, CT, MRI)",
  "Structured clinical reports",
  "Full consultation history",
  "Learning mode with clinical reasoning",
  "Hindi + English language support",
  "Priority email support",
];

interface LandingPricingProps {
  onStartTrial: () => void;
}

const LandingPricing = ({ onStartTrial }: LandingPricingProps) => (
  <section id="pricing" className="py-20 md:py-28 px-4 border-t border-border/30" aria-labelledby="pricing-heading">
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-10">
        <h2 id="pricing-heading" className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
        <p className="text-muted-foreground">
          Start free. Upgrade when you're ready. No hidden charges.
        </p>
      </div>

      <div className="rounded-2xl border-2 border-primary/40 bg-card/80 overflow-hidden shadow-xl shadow-primary/5">
        <div className="bg-primary/10 text-primary text-center text-sm font-semibold py-2">
          3-Day Free Trial Included — No Payment Required
        </div>
        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-2xl font-bold">Pro Plan</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-5xl font-bold tracking-tight">₹1,499</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">After free trial • Cancel anytime</p>
          </div>
          <ul className="space-y-3">
            {pricingFeatures.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-success shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Button
            className="w-full gap-2 bg-success hover:bg-success/90 text-success-foreground h-12 text-base font-semibold shadow-lg shadow-success/20"
            onClick={onStartTrial}
          >
            Start Free Trial <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure & Private</span>
            <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> No payment upfront</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default LandingPricing;
