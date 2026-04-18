import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Language } from "@/types/clinical";

interface LanguageToggleProps {
  language: Language;
  onChange: (lang: Language) => void;
}

const languageMeta: Record<Language, { short: string; native: string; english: string }> = {
  en: { short: "EN", native: "English", english: "English" },
  hi: { short: "हिं", native: "हिन्दी", english: "Hindi" },
  ta: { short: "த", native: "தமிழ்", english: "Tamil" },
  te: { short: "తె", native: "తెలుగు", english: "Telugu" },
  bn: { short: "বাং", native: "বাংলা", english: "Bengali" },
  mr: { short: "मरा", native: "मराठी", english: "Marathi" },
};

const order: Language[] = ["en", "hi", "ta", "te", "bn", "mr"];

const LanguageToggle = ({ language, onChange }: LanguageToggleProps) => {
  const current = languageMeta[language];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-muted text-foreground hover:bg-muted/80 transition-colors"
          aria-label="Change language"
        >
          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{current.short}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {order.map((lang) => {
          const meta = languageMeta[lang];
          const active = lang === language;
          return (
            <DropdownMenuItem
              key={lang}
              onClick={() => onChange(lang)}
              className={active ? "bg-primary/10 text-primary font-medium" : ""}
            >
              <span className="flex-1">{meta.native}</span>
              <span className="text-xs text-muted-foreground ml-2">{meta.english}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
