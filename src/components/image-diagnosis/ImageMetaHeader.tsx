import { Brain, Activity, Gauge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ProgressionBadge from "./ProgressionBadge";
import type { MultiImageDiagnosis } from "@/types/clinical";

interface Props {
  diagnosis: MultiImageDiagnosis;
  urgencyBadge: (level: string) => JSX.Element;
}

const qualityColor = (q?: string) => {
  if (q === "Good") return "text-success";
  if (q === "Adequate") return "text-primary";
  if (q === "Poor") return "text-warning";
  return "text-destructive";
};

const ImageMetaHeader = ({ diagnosis, urgencyBadge }: Props) => {
  return (
    <div className="glass-card p-4 space-y-3">
      {/* Row 1: Meta badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {diagnosis.image_modality && (
          <Badge variant="outline" className="text-xs gap-1">
            <Activity className="h-3 w-3" />
            {diagnosis.image_modality}
          </Badge>
        )}
        {diagnosis.anatomical_region && (
          <Badge variant="outline" className="text-xs">
            {diagnosis.anatomical_region}
          </Badge>
        )}
        {diagnosis.image_quality && (
          <Badge variant="outline" className={`text-xs ${qualityColor(diagnosis.image_quality)}`}>
            Quality: {diagnosis.image_quality}
          </Badge>
        )}
        {diagnosis.confidence_score && (
          <Badge variant="secondary" className="text-xs gap-1">
            <Gauge className="h-3 w-3" />
            {diagnosis.confidence_score}% confidence
          </Badge>
        )}
      </div>

      {/* Row 2: Summary + urgency + progression */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Most Likely Diagnosis</h3>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {diagnosis.progression_status && (
            <ProgressionBadge status={diagnosis.progression_status} />
          )}
          {urgencyBadge(diagnosis.urgency_level)}
        </div>
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed">{diagnosis.combined_summary}</p>
      {diagnosis.progression_notes && (
        <p className="text-xs text-primary/80 italic border-l-2 border-primary/30 pl-2">{diagnosis.progression_notes}</p>
      )}
    </div>
  );
};

export default ImageMetaHeader;
