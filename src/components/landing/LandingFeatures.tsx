import { Brain, Stethoscope, FileText } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Symptom Analysis & Differential Diagnosis",
    description:
      "Enter patient symptoms and receive AI-powered differential diagnoses with risk scoring, clinical reasoning, and evidence-based suggestions — like a second opinion in seconds.",
  },
  {
    icon: Stethoscope,
    title: "Radiology AI Image Interpretation",
    description:
      "Upload X-rays, CT scans, MRIs, or clinical photos for AI-assisted pattern detection, preliminary analysis, and structured radiology-style reporting.",
  },
  {
    icon: FileText,
    title: "Structured Clinical Reports",
    description:
      "Generate professional clinical reports with treatment recommendations, prescription suggestions, and follow-up plans — ready for OPD documentation.",
  },
];

const LandingFeatures = () => (
  <section className="py-20 md:py-28 px-4" aria-labelledby="features-heading">
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-14">
        <h2 id="features-heading" className="text-3xl md:text-4xl font-bold mb-4">
          Everything a Doctor Needs for{" "}
          <span className="text-primary">Smarter Diagnosis</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          AI clinical tools built for real OPD workflows — fast, accurate, and designed for Indian healthcare professionals.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f) => (
          <article
            key={f.title}
            className="group rounded-2xl border border-border/50 bg-card/60 p-7 space-y-4 hover:border-primary/30 hover:bg-card/80 transition-all duration-300"
          >
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <f.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default LandingFeatures;
