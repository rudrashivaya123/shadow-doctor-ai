import { Stethoscope, Baby, Bone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Specialty } from "@/types/clinical";

interface SpecialtySelectorProps {
  value: Specialty;
  onChange: (s: Specialty) => void;
}

const specialties: { key: Specialty; label: string; icon: typeof Stethoscope }[] = [
  { key: "general", label: "GP", icon: Stethoscope },
  { key: "pediatrics", label: "Peds", icon: Baby },
  { key: "orthopedics", label: "Ortho", icon: Bone },
];

const SpecialtySelector = ({ value, onChange }: SpecialtySelectorProps) => (
  <div className="flex gap-1">
    {specialties.map(({ key, label, icon: Icon }) => (
      <Button
        key={key}
        size="sm"
        variant={value === key ? "default" : "outline"}
        onClick={() => onChange(key)}
        className="gap-1 text-xs h-7 px-2"
      >
        <Icon className="h-3 w-3" />
        {label}
      </Button>
    ))}
  </div>
);

export default SpecialtySelector;
