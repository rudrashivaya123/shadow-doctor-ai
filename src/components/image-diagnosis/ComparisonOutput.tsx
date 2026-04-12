import { GitCompareArrows } from "lucide-react";
import ProgressionBadge from "./ProgressionBadge";
import type { ImageComparisonResult } from "@/types/clinical";

interface ComparisonOutputProps {
  result: ImageComparisonResult;
}

const ComparisonOutput = ({ result }: ComparisonOutputProps) => {
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <GitCompareArrows className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground text-sm">
            {result.image_a_label} vs {result.image_b_label}
          </h3>
        </div>
        <ProgressionBadge status={result.progression_status} />
      </div>

      <div className="space-y-2">
        <div className="space-y-1">
          <p className="text-xs font-medium text-foreground">Key Differences</p>
          <ul className="space-y-1 text-sm text-foreground/80">
            {result.key_differences.map((d, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary shrink-0 mt-0.5">→</span>{d}
              </li>
            ))}
          </ul>
        </div>

        {result.size_changes && (
          <p className="text-xs bg-muted/50 rounded px-2 py-1.5 text-foreground/80">
            <span className="font-medium">Size:</span> {result.size_changes}
          </p>
        )}
        {result.color_texture_changes && (
          <p className="text-xs bg-muted/50 rounded px-2 py-1.5 text-foreground/80">
            <span className="font-medium">Color/Texture:</span> {result.color_texture_changes}
          </p>
        )}
        <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2">
          {result.clinical_significance}
        </p>
      </div>
    </div>
  );
};

export default ComparisonOutput;
