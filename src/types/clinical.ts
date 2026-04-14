export type Language = "en" | "hi";

export type Specialty = "general" | "pediatrics" | "orthopedics";

export interface Patient {
  id: string;
  user_id: string;
  name: string;
  age: number | null;
  gender: string | null;
  phone: string | null;
  created_at: string;
}

export interface ClinicalInput {
  symptoms: string;
  doctorNotes: string;
  language: Language;
  specialty?: Specialty;
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
  risk_score?: number;
  learning_explanations?: {
    diagnosis: string;
    explanation: string;
  }[];
  clinical_insights?: string[];
  common_mistakes?: string[];
}

export interface Alert {
  type: "critical" | "warning" | "safe";
  message: string;
}

export interface ImageItem {
  id: string;
  base64: string;
  mimeType: string;
  preview: string;
  label: string;
  note: string;
  timestamp?: string;
  tags?: string[];
}

export interface PerImageObservation {
  image_label: string;
  findings: string[];
  notes: string;
  suggested_tags?: string[];
}

export type ProgressionStatus = "improving" | "worsening" | "stable" | "mixed";

export interface ImageComparisonResult {
  image_a_label: string;
  image_b_label: string;
  key_differences: string[];
  size_changes: string;
  color_texture_changes: string;
  progression_status: ProgressionStatus;
  clinical_significance: string;
}

export interface SelfCheck {
  could_be_wrong: string;
  dangerous_missed_diagnosis: string;
  adjusted_confidence?: number;
}

export interface MultiImageDiagnosis {
  image_modality?: string;
  anatomical_region?: string;
  image_quality?: "Good" | "Adequate" | "Poor" | "Insufficient";
  per_image_observations: PerImageObservation[];
  pattern_recognition?: string;
  combined_summary: string;
  possible_diagnoses: {
    name: string;
    confidence: number;
    description: string;
  }[];
  differential_diagnosis: string[];
  key_visual_findings: string[];
  diagnostic_criteria: {
    matched: string[];
    missing: string[];
  };
  confidence_score?: number;
  red_flags: string[];
  urgency_level: "Low" | "Moderate" | "HIGH RISK";
  suggested_tests: string[];
  next_steps: string[];
  self_check?: SelfCheck;
  progression_notes?: string;
  progression_status?: ProgressionStatus;
  cross_image_comparison?: string[];
}

// Keep legacy single-image type for backwards compat
export interface ImageDiagnosis {
  ai_summary: string;
  possible_diagnoses: {
    name: string;
    confidence: number;
    description: string;
  }[];
  key_visual_findings: string[];
  diagnostic_criteria: {
    matched: string[];
    missing: string[];
  };
  red_flags: string[];
  urgency_level: "Low" | "Moderate" | "HIGH RISK";
  suggested_tests: string[];
  next_steps: string[];
}

export interface QuickSuggestion {
  text: string;
  category: "symptom" | "condition" | "test";
}

export interface OfflineEntry {
  id: string;
  symptoms: string;
  notes: string;
  language: Language;
  specialty: Specialty;
  timestamp: number;
  synced: boolean;
}
