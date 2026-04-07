import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, Brain, Stethoscope, FileText, Shield, ArrowRight,
  CheckCircle, Star, Lock, Zap, Users, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AppFooter from "@/components/AppFooter";
import CheckoutModal from "@/components/CheckoutModal";

const features = [
  {
    icon: Brain,
    title: "AI Symptom Analysis",
    description: "Enter symptoms and receive AI-powered differential diagnoses with risk scoring and clinical reasoning.",
  },
  {
    icon: Stethoscope,
    title: "Radiology AI Support",
    description: "Upload medical images for AI-assisted preliminary analysis and pattern detection.",
  },
  {
    icon: FileText,
    title: "Structured Reports",
    description: "Generate professional clinical reports with treatment recommendations in seconds.",
  },
];

const pricingFeatures = [
  "Unlimited AI consultations",
  "Radiology AI image analysis",
  "Structured clinical reports",
  "Full consultation history",
  "Learning mode & reasoning",
  "Priority email support",
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    if (document.getElementById("razorpay-script")) return;
    const s = document.createElement("script");
    s.id = "razorpay-script";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">ShadowMD</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={scrollToPricing}
            >
              Pricing
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative py-20 md:py-32 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="max-w-3xl mx-auto text-center space-y-6 relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary font-medium">
              <Zap className="h-3.5 w-3.5" />
              AI-Powered Clinical Decision Support
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight">
              AI Clinical Assistant{" "}
              <span className="text-primary">for Doctors</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Diagnose faster with AI-powered symptom analysis, radiology support, and structured clinical reporting — all in one platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                size="lg"
                className="gap-2 bg-success hover:bg-success/90 text-success-foreground h-12 px-8 text-base font-semibold shadow-lg shadow-success/20"
                onClick={() => navigate("/auth")}
              >
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base"
                onClick={scrollToPricing}
              >
                View Pricing
              </Button>
            </div>
            <p className="text-xs text-muted-foreground pt-2">3-day free trial • No credit card required</p>
          </div>
        </section>

        {/* Social proof */}
        <section className="py-8 px-4 border-y border-border/30">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-primary" /> Trusted by 500+ doctors</span>
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" /> HIPAA-aware design</span>
            <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-warning" /> 4.8/5 average rating</span>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 md:py-28 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything you need for{" "}
                <span className="text-primary">smarter diagnosis</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Powerful AI tools designed specifically for healthcare professionals.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-border/50 bg-card/60 p-7 space-y-4 hover:border-primary/30 hover:bg-card/80 transition-all duration-300"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 md:py-28 px-4 border-t border-border/30">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
              <p className="text-muted-foreground">
                One plan. Everything included. Start with a free trial.
              </p>
            </div>

            <div className="rounded-2xl border-2 border-primary/40 bg-card/80 overflow-hidden shadow-xl shadow-primary/5">
              {/* Badge */}
              <div className="bg-primary/10 text-primary text-center text-sm font-semibold py-2">
                Most Popular
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-bold">Pro Plan</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-5xl font-bold tracking-tight">₹1,499</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
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
                  onClick={() => setCheckoutOpen(true)}
                >
                  Upgrade Now <ChevronRight className="h-4 w-4" />
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  3-day free trial included • Cancel anytime
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Demo access for verification */}
        <section className="py-12 px-4 border-t border-border/30">
          <div className="max-w-lg mx-auto">
            <div className="rounded-xl border border-border/60 bg-card/60 p-6 text-center space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Demo Access for Verification
              </h3>
              <div className="space-y-1">
                <p className="text-sm text-foreground">
                  Email: <code className="bg-muted px-2 py-0.5 rounded text-primary text-xs">demo@shadowmd.com</code>
                </p>
                <p className="text-sm text-foreground">
                  Password: <code className="bg-muted px-2 py-0.5 rounded text-primary text-xs">Demo@123</code>
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                Login as Demo User
              </Button>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="py-6 px-4 border-t border-border/30">
          <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
            ⚕️ ShadowMD is an AI-assisted tool and is not a substitute for professional medical judgment.
            Always verify AI suggestions with clinical expertise.
          </p>
        </section>
      </main>

      <AppFooter />
      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </div>
  );
};

export default LandingPage;
