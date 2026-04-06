export type Language = "en" | "hi" | "mr";

export interface ClinicalInput {
  symptoms: string;
  doctorNotes: string;
  language: Language;
}

export interface ClinicalAnalysis {
  primary_diagnosis: string;
  differentials: string[];
  emergency_level: string;
  immediate_management: string[];
  investigations: string[];
  treatment: string[];
  red_flags: string[];
  missed_possibilities: string[];
  reasoning: string;
}

export interface Alert {
  type: "critical" | "warning" | "safe";
  message: string;
}
