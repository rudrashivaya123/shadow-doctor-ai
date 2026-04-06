import { Globe } from "lucide-react";
import type { Language } from "@/types/clinical";

interface LanguageToggleProps {
  language: Language;
  onChange: (lang: Language) => void;
}

const labels: Record<Language, string> = {
  en: "EN",
  hi: "हिं",
  mr: "मर",
};

const LanguageToggle = ({ language, onChange }: LanguageToggleProps) => {
  const langs: Language[] = ["en", "hi", "mr"];

  return (
    <div className="flex items-center gap-1.5">
      <Globe className="h-4 w-4 text-muted-foreground" />
      {langs.map((lang) => (
        <button
          key={lang}
          onClick={() => onChange(lang)}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            language === lang
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {labels[lang]}
        </button>
      ))}
    </div>
  );
};

export default LanguageToggle;
