import { CalendarClock, AlertCircle } from "lucide-react";

interface Props {
  followUp: string;
  uncertainty: string;
}

const FollowUpCard = ({ followUp, uncertainty }: Props) => (
  <div className="rounded-lg border bg-card p-3 space-y-2">
    <div className="flex items-start gap-1.5">
      <CalendarClock className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
      <div>
        <span className="text-[10px] text-muted-foreground uppercase">Follow-up</span>
        <p className="text-sm text-foreground">{followUp}</p>
      </div>
    </div>
    {uncertainty && (
      <div className="flex items-start gap-1.5 border-t pt-2">
        <AlertCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-[10px] text-muted-foreground italic">{uncertainty}</p>
      </div>
    )}
  </div>
);

export default FollowUpCard;
