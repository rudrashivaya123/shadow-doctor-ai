export interface EviSmartDiagnosis {
  name: string;
  confidence: number;
}

export interface EviSmartResult {
  probable_diagnoses: EviSmartDiagnosis[];
  red_flags: string[];
  first_line_treatment: string;
  alternatives: string;
  investigations: string[];
  evidence_snapshot: string[];
  clinical_pearl: string;
  refer_if: string;
  uncertainty_note: string;
}
