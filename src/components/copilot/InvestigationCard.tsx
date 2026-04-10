import { FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  investigations: string[];
}

const InvestigationCard = ({ investigations }: Props) => (
  <div className="rounded-lg border bg-card p-3 space-y-1.5">
    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground uppercase tracking-wide">
      <FlaskConical className="h-3.5 w-3.5 text-primary" />
      Investigations
    </div>
    <div className="flex flex-wrap gap-1.5">
      {investigations.map((inv, i) => (
        <Badge key={i} variant="secondary" className="text-[10px]">{inv}</Badge>
      ))}
    </div>
  </div>
);

export default InvestigationCard;
