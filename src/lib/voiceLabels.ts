// Localized labels used when narrating AI results via TTS.
// Keeping the spoken text in the user's selected language ensures the
// browser's speech synthesis picks the correct voice for the entire utterance.

export type VoiceLangKey = "en" | "hi" | "mr" | "ta" | "te" | "bn";

export interface VoiceLabels {
  emergency: string;
  likelyDiagnoses: string;
  probableDiagnoses: string;
  confidence: string; // e.g., "confidence" — used as: `${name}, ${confidence} 80 ${percent}`
  percent: string;
  prescriptions: string;
  for: string; // duration connector: "for 5 days"
  advice: string;
  redFlags: string;
  investigations: string;
  followUp: string;
  firstLineTreatment: string;
  alternatives: string;
  evidence: string;
  clinicalPearl: string;
  referIf: string;
}

const en: VoiceLabels = {
  emergency: "Emergency. Refer immediately.",
  likelyDiagnoses: "Likely diagnoses",
  probableDiagnoses: "Probable diagnoses",
  confidence: "confidence",
  percent: "percent",
  prescriptions: "Prescriptions",
  for: "for",
  advice: "Advice",
  redFlags: "Red flags",
  investigations: "Investigations",
  followUp: "Follow up",
  firstLineTreatment: "First line treatment",
  alternatives: "Alternatives",
  evidence: "Evidence",
  clinicalPearl: "Clinical pearl",
  referIf: "Refer if",
};

const hi: VoiceLabels = {
  emergency: "आपातकाल। तुरंत रेफर करें।",
  likelyDiagnoses: "संभावित निदान",
  probableDiagnoses: "संभावित निदान",
  confidence: "विश्वास",
  percent: "प्रतिशत",
  prescriptions: "दवाइयाँ",
  for: "के लिए",
  advice: "सलाह",
  redFlags: "चेतावनी संकेत",
  investigations: "जाँचें",
  followUp: "फॉलो अप",
  firstLineTreatment: "पहली पंक्ति उपचार",
  alternatives: "विकल्प",
  evidence: "साक्ष्य",
  clinicalPearl: "क्लिनिकल सुझाव",
  referIf: "रेफर करें यदि",
};

const mr: VoiceLabels = {
  emergency: "आणीबाणी. त्वरित रेफर करा.",
  likelyDiagnoses: "संभाव्य निदान",
  probableDiagnoses: "संभाव्य निदान",
  confidence: "विश्वास",
  percent: "टक्के",
  prescriptions: "औषधे",
  for: "साठी",
  advice: "सल्ला",
  redFlags: "धोक्याचे संकेत",
  investigations: "तपासण्या",
  followUp: "फॉलो अप",
  firstLineTreatment: "पहिली ओळ उपचार",
  alternatives: "पर्याय",
  evidence: "पुरावा",
  clinicalPearl: "क्लिनिकल टीप",
  referIf: "रेफर करा जर",
};

const ta: VoiceLabels = {
  emergency: "அவசரம். உடனே பரிந்துரைக்கவும்.",
  likelyDiagnoses: "சாத்தியமான நோய்கள்",
  probableDiagnoses: "சாத்தியமான நோய்கள்",
  confidence: "நம்பிக்கை",
  percent: "சதவீதம்",
  prescriptions: "மருந்துகள்",
  for: "க்கான",
  advice: "ஆலோசனை",
  redFlags: "எச்சரிக்கை அறிகுறிகள்",
  investigations: "பரிசோதனைகள்",
  followUp: "பின்தொடர்தல்",
  firstLineTreatment: "முதன்மை சிகிச்சை",
  alternatives: "மாற்றுகள்",
  evidence: "சான்று",
  clinicalPearl: "மருத்துவ குறிப்பு",
  referIf: "பரிந்துரைக்கவும் என்றால்",
};

const te: VoiceLabels = {
  emergency: "అత్యవసరం. వెంటనే రెఫర్ చేయండి.",
  likelyDiagnoses: "సాధ్యమైన నిర్ధారణలు",
  probableDiagnoses: "సాధ్యమైన నిర్ధారణలు",
  confidence: "విశ్వాసం",
  percent: "శాతం",
  prescriptions: "మందులు",
  for: "కోసం",
  advice: "సలహా",
  redFlags: "హెచ్చరిక సంకేతాలు",
  investigations: "పరీక్షలు",
  followUp: "ఫాలో అప్",
  firstLineTreatment: "ప్రథమ చికిత్స",
  alternatives: "ప్రత్యామ్నాయాలు",
  evidence: "ఆధారం",
  clinicalPearl: "వైద్య సూచన",
  referIf: "రెఫర్ చేయండి ఒకవేళ",
};

const bn: VoiceLabels = {
  emergency: "জরুরি। অবিলম্বে রেফার করুন।",
  likelyDiagnoses: "সম্ভাব্য রোগ নির্ণয়",
  probableDiagnoses: "সম্ভাব্য রোগ নির্ণয়",
  confidence: "আত্মবিশ্বাস",
  percent: "শতাংশ",
  prescriptions: "ঔষধ",
  for: "জন্য",
  advice: "পরামর্শ",
  redFlags: "সতর্কতা চিহ্ন",
  investigations: "পরীক্ষা",
  followUp: "ফলো আপ",
  firstLineTreatment: "প্রথম সারির চিকিৎসা",
  alternatives: "বিকল্প",
  evidence: "প্রমাণ",
  clinicalPearl: "ক্লিনিকাল টিপ",
  referIf: "রেফার করুন যদি",
};

const map: Record<VoiceLangKey, VoiceLabels> = { en, hi, mr, ta, te, bn };

export const getVoiceLabels = (lang: string): VoiceLabels =>
  map[(lang as VoiceLangKey)] || en;
