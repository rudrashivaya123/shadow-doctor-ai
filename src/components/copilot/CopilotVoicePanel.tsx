import VoiceControls from "@/components/VoiceControls";
import type { CopilotResult } from "@/types/copilot";

interface Props {
  result: CopilotResult;
  language?: string;
}

const buildSpeech = (r: CopilotResult): string => {
  const parts: string[] = [];
  if (r.emergency) {
    parts.push("Emergency. Refer immediately.");
    if (r.emergency_message) parts.push(r.emergency_message);
  }
  if (r.diagnosis?.length) {
    const dx = r.diagnosis
      .slice(0, 3)
      .map((d, i) => `${i + 1}. ${d.name}, confidence ${d.confidence} percent`)
      .join(". ");
    parts.push(`Likely diagnoses: ${dx}.`);
  }
  if (r.prescriptions?.length) {
    const rx = r.prescriptions
      .map((p) => `${p.drug}, ${p.dose}, for ${p.duration}`)
      .join("; ");
    parts.push(`Prescriptions: ${rx}.`);
  }
  if (r.advice?.length) parts.push(`Advice: ${r.advice.join(". ")}.`);
  if (r.red_flags?.length) parts.push(`Red flags: ${r.red_flags.join(". ")}.`);
  if (r.investigations?.length) parts.push(`Investigations: ${r.investigations.join(", ")}.`);
  if (r.follow_up) parts.push(`Follow up: ${r.follow_up}.`);
  if (r.uncertainty_note) parts.push(r.uncertainty_note);
  return parts.join(" ");
};

const CopilotVoicePanel = ({ result, language = "en" }: Props) => {
  const text = buildSpeech(result);
  if (!text) return null;
  return (
    <div className="glass-card p-3 flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">Voice response</span>
      <VoiceControls text={text} language={language} autoPlay label="Play" />
    </div>
  );
};

export default CopilotVoicePanel;
