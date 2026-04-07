import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}

const ConsentCheckbox = ({ checked, onChange }: ConsentCheckboxProps) => {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/40 border border-border/60">
      <Checkbox id="consent" checked={checked} onCheckedChange={(v) => onChange(v === true)} className="mt-0.5" />
      <Label htmlFor="consent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
        <ShieldCheck className="h-3.5 w-3.5 inline mr-1 text-primary" />
        Patient consent obtained for storing medical data. Data is restricted to this doctor account only.
      </Label>
    </div>
  );
};

export default ConsentCheckbox;
