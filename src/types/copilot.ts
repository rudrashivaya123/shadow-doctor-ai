export interface CopilotDiagnosis {
  name: string;
  confidence: number;
}

export interface CopilotPrescription {
  drug: string;
  dose: string;
  duration: string;
}

export interface CopilotResult {
  diagnosis: CopilotDiagnosis[];
  prescriptions: CopilotPrescription[];
  advice: string[];
  red_flags: string[];
  investigations: string[];
  follow_up: string;
  emergency: boolean;
  emergency_message: string;
  uncertainty_note: string;
}
