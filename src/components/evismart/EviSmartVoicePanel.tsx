import VoiceControls from "@/components/VoiceControls";
import type { EviSmartResult } from "@/types/evismart";
import { getVoiceLabels } from "@/lib/voiceLabels";

interface Props {
  result: EviSmartResult;
  language?: string;
}

const buildSpeech = (r: EviSmartResult, language: string): string => {
  const L = getVoiceLabels(language);
  const parts: string[] = [];
  if (r.probable_diagnoses?.length) {
    const dx = r.probable_diagnoses
      .slice(0, 3)
      .map((d, i) => `${i + 1}. ${d.name}, ${L.confidence} ${d.confidence} ${L.percent}`)
      .join(". ");
    parts.push(`${L.probableDiagnoses}: ${dx}.`);
  }
  if (r.red_flags?.length) parts.push(`${L.redFlags}: ${r.red_flags.join(". ")}.`);
  if (r.first_line_treatment) parts.push(`${L.firstLineTreatment}: ${r.first_line_treatment}.`);
  if (r.alternatives) parts.push(`${L.alternatives}: ${r.alternatives}.`);
  if (r.investigations?.length) parts.push(`${L.investigations}: ${r.investigations.join(", ")}.`);
  if (r.evidence_snapshot?.length) parts.push(`${L.evidence}: ${r.evidence_snapshot.join(". ")}.`);
  if (r.clinical_pearl) parts.push(`${L.clinicalPearl}: ${r.clinical_pearl}.`);
  if (r.refer_if) parts.push(`${L.referIf}: ${r.refer_if}.`);
  if (r.uncertainty_note) parts.push(r.uncertainty_note);
  return parts.join(" ");
};

const EviSmartVoicePanel = ({ result, language = "en" }: Props) => {
  const text = buildSpeech(result, language);
  if (!text) return null;
  return (
    <div className="glass-card p-3 flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">Voice response</span>
      <VoiceControls text={text} language={language} autoPlay label="Play" />
    </div>
  );
};

export default EviSmartVoicePanel;
