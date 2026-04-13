import { Image as ImageIcon, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PerImageObservation } from "@/types/clinical";

interface Props {
  observations: PerImageObservation[];
}

const PerImageSection = ({ observations }: Props) => {
  if (observations.length === 0) return null;

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-foreground">Per-Image Observations</h3>
      </div>
      <div className="space-y-3">
        {observations.map((obs, i) => (
          <div key={i} className="bg-muted/40 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <p className="text-xs font-semibold text-primary">{obs.image_label}</p>
              {obs.suggested_tags && obs.suggested_tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {obs.suggested_tags.map((tag, j) => (
                    <Badge key={j} variant="secondary" className="text-[10px] px-1.5 py-0 h-4 gap-0.5">
                      <Tag className="h-2 w-2" />{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <ul className="space-y-1 text-sm text-foreground/80">
              {obs.findings.map((f, j) => (
                <li key={j} className="flex items-start gap-2">
                  <span className="text-primary shrink-0 mt-0.5">→</span>{f}
                </li>
              ))}
            </ul>
            {obs.notes && <p className="text-xs text-muted-foreground italic">{obs.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerImageSection;
