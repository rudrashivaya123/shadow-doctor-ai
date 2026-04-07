import { Shield } from "lucide-react";

const MedicalDisclaimer = () => (
  <footer className="border-t border-border/40 bg-card/30 px-4 py-2">
    <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground text-center">
      <Shield className="h-3 w-3 shrink-0" />
      <span>
        This is an AI clinical support tool and not a replacement for professional medical judgment.
        Always verify with clinical assessment.
      </span>
    </div>
  </footer>
);

export default MedicalDisclaimer;
