import { Siren } from "lucide-react";

interface Props {
  flags: string[];
}

const RedFlagCard = ({ flags }: Props) => (
  <div className="border border-destructive/30 bg-destructive/5 rounded-lg p-3 space-y-1.5">
    <div className="flex items-center gap-1.5 text-destructive font-semibold text-xs uppercase">
      <Siren className="h-3.5 w-3.5" />
      Red Flags
    </div>
    <ul className="space-y-1">
      {flags.map((flag, i) => (
        <li key={i} className="text-xs text-destructive/90 flex items-start gap-1.5">
          <span className="mt-1 h-1 w-1 rounded-full bg-destructive shrink-0" />
          {flag}
        </li>
      ))}
    </ul>
  </div>
);

export default RedFlagCard;
