import { Users, Shield, Star, Award } from "lucide-react";

const LandingSocialProof = () => (
  <section className="py-8 px-4 border-y border-border/30" aria-label="Trust indicators">
    <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground">
      <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-primary" /> Trusted by 500+ Doctors in India</span>
      <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" /> HIPAA-Aware & Encrypted</span>
      <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-warning" /> 4.8/5 Average Rating</span>
      <span className="flex items-center gap-1.5"><Award className="h-4 w-4 text-primary" /> Used in 50+ Indian Cities</span>
    </div>
  </section>
);

export default LandingSocialProof;
