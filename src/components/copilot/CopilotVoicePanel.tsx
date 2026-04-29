import VoiceControls from "@/components/VoiceControls";
import type { CopilotResult } from "@/types/copilot";
import { getVoiceLabels } from "@/lib/voiceLabels";

interface Props {
  result: CopilotResult;
  language?: string;
}

const buildSpeech = (r: CopilotResult, language: string): string => {
  const L = getVoiceLabels(language);
  const parts: string[] = [];
  if (r.emergency) {
    parts.push(L.emergency);
    if (r.emergency_message) parts.push(r.emergency_message);
  }
  if (r.diagnosis?.length) {
    const dx = r.diagnosis
      .slice(0, 3)
      .map((d, i) => `${i + 1}. ${d.name}, ${L.confidence} ${d.confidence} ${L.percent}`)
      .join(". ");
    parts.push(`${L.likelyDiagnoses}: ${dx}.`);
  }
  if (r.prescriptions?.length) {
    const rx = r.prescriptions
      .map((p) => `${p.drug}, ${p.dose}, ${L.for} ${p.duration}`)
      .join("; ");
    parts.push(`${L.prescriptions}: ${rx}.`);
  }
  if (r.advice?.length) parts.push(`${L.advice}: ${r.advice.join(". ")}.`);
  if (r.red_flags?.length) parts.push(`${L.redFlags}: ${r.red_flags.join(". ")}.`);
  if (r.investigations?.length) parts.push(`${L.investigations}: ${r.investigations.join(", ")}.`);
  if (r.follow_up) parts.push(`${L.followUp}: ${r.follow_up}.`);
  if (r.uncertainty_note) parts.push(r.uncertainty_note);
  return parts.join(" ");
};

const CopilotVoicePanel = ({ result, language = "en" }: Props) => {
  const text = buildSpeech(result, language);
  if (!text) return null;
  return (
    <div className="glass-card p-3 flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">Voice response</span>
      <VoiceControls text={text} language={language} autoPlay label="Play" />
    </div>
  );
};

export default CopilotVoicePanel;
