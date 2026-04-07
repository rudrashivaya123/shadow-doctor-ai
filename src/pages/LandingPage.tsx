import { useNavigate } from "react-router-dom";
import { Activity, Stethoscope, Brain, FileText, ArrowRight } from "lucide-react";
import AppFooter from "@/components/AppFooter";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Brain,
    title: "AI Symptom Analysis",
    description: "Enter symptoms and get AI-powered differential diagnoses with risk scoring.",
  },
  {
    icon: Stethoscope,
    title: "Radiology AI Support",
    description: "Upload medical images for AI-assisted preliminary analysis.",
  },
  {
    icon: FileText,
    title: "Structured Reports",
    description: "Generate professional clinical reports with treatment recommendations.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "HIPAA-aware design with role-based access and encrypted data handling.",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <header className="border-b border-border/40">
        <div className="max-w-5xl mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-primary/15 flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold">ShadowMD</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
        </div>
      </header>

      <main>
        {/* Hero section */}
        <section className="py-20 md:py-32 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Activity className="h-3.5 w-3.5" />
              AI Clinical Decision Support
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
              Smarter Clinical Decisions,{" "}
              <span className="text-primary">Powered by AI</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              ShadowMD assists healthcare professionals with AI-driven symptom analysis,
              differential diagnosis, and structured clinical reporting — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button size="lg" className="gap-2" onClick={() => navigate("/auth")}>
                Try Demo <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 border-t border-border/40">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10">Key Features</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border border-border/60 bg-card p-5 space-y-3"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <AppFooter />
    </div>
  );
};

export default LandingPage;
