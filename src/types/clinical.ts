export type Language = "en" | "hi" | "mr";

export interface ClinicalInput {
  symptoms: string;
  doctorNotes: string;
  language: Language;
}

export interface ClinicalAnalysis {
  differential_diagnosis: string[];
  missed_risks: string[];
  questions_to_ask: string[];
  tests_suggested: string[];
  red_flags: string[];
}

export interface Alert {
  type: "critical" | "warning" | "safe";
  message: string;
}
