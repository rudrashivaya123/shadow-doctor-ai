import type { ClinicalAnalysis } from "@/types/clinical";
import { FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConsultationSummaryProps {
  symptoms: string;
  notes: string;
  analysis: ClinicalAnalysis;
}

const ConsultationSummary = ({ symptoms, notes, analysis }: ConsultationSummaryProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="glass-card p-4 md:p-6 space-y-4 print:bg-white print:text-black" id="soap-summary">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">SOAP Summary</h3>
        </div>
        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 print:hidden">
          <Printer className="h-3.5 w-3.5" />
          Print
        </Button>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <span className="font-semibold text-primary">S — Subjective:</span>
          <p className="text-foreground/80 mt-1">{symptoms}</p>
        </div>

        <div>
          <span className="font-semibold text-primary">O — Objective:</span>
          <p className="text-foreground/80 mt-1">{notes || "No objective findings documented."}</p>
        </div>

        <div>
          <span className="font-semibold text-primary">A — Assessment:</span>
          <p className="text-foreground/80 mt-1 font-medium">{analysis.primary_diagnosis}</p>
          <ul className="text-foreground/80 mt-1 space-y-0.5">
            {(analysis.differentials ?? []).map((dx, i) => (
              <li key={i}>
                {i + 1}. {dx}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <span className="font-semibold text-primary">P — Plan:</span>
          <ul className="text-foreground/80 mt-1 space-y-0.5">
            {(analysis.treatment ?? []).map((step, i) => (
              <li key={i}>• {step}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-xs text-muted-foreground border-t border-border/40 pt-3">
        ⚕️ AI-assisted clinical summary — for decision support only. Not a substitute for clinical judgment.
      </p>
    </div>
  );
};

export default ConsultationSummary;
