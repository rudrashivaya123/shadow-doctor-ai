import VoiceControls from "@/components/VoiceControls";
import type { EviSmartResult } from "@/types/evismart";

interface Props {
  result: EviSmartResult;
  language?: string;
}

const buildSpeech = (r: EviSmartResult): string => {
  const parts: string[] = [];
  if (r.probable_diagnoses?.length) {
    const dx = r.probable_diagnoses
      .slice(0, 3)
      .map((d, i) => `${i + 1}. ${d.name}, confidence ${d.confidence} percent`)
      .join(". ");
    parts.push(`Probable diagnoses: ${dx}.`);
  }
  if (r.red_flags?.length) parts.push(`Red flags: ${r.red_flags.join(". ")}.`);
  if (r.first_line_treatment) parts.push(`First line treatment: ${r.first_line_treatment}.`);
  if (r.alternatives) parts.push(`Alternatives: ${r.alternatives}.`);
  if (r.investigations?.length) parts.push(`Investigations: ${r.investigations.join(", ")}.`);
  if (r.evidence_snapshot?.length) parts.push(`Evidence: ${r.evidence_snapshot.join(". ")}.`);
  if (r.clinical_pearl) parts.push(`Clinical pearl: ${r.clinical_pearl}.`);
  if (r.refer_if) parts.push(`Refer if: ${r.refer_if}.`);
  if (r.uncertainty_note) parts.push(r.uncertainty_note);
  return parts.join(" ");
};

const EviSmartVoicePanel = ({ result, language = "en" }: Props) => {
  const text = buildSpeech(result);
  if (!text) return null;
  return (
    <div className="glass-card p-3 flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">Voice response</span>
      <VoiceControls text={text} language={language} autoPlay label="Play" />
    </div>
  );
};

export default EviSmartVoicePanel;
