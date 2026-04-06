import { useState, useEffect, useRef } from "react";
import type { QuickSuggestion } from "@/types/clinical";

const SYMPTOM_DB: QuickSuggestion[] = [
  { text: "fever", category: "symptom" },
  { text: "headache", category: "symptom" },
  { text: "chest pain", category: "symptom" },
  { text: "shortness of breath", category: "symptom" },
  { text: "abdominal pain", category: "symptom" },
  { text: "nausea", category: "symptom" },
  { text: "vomiting", category: "symptom" },
  { text: "diarrhea", category: "symptom" },
  { text: "cough", category: "symptom" },
  { text: "sore throat", category: "symptom" },
  { text: "body aches", category: "symptom" },
  { text: "fatigue", category: "symptom" },
  { text: "dizziness", category: "symptom" },
  { text: "rash", category: "symptom" },
  { text: "swelling", category: "symptom" },
  { text: "joint pain", category: "symptom" },
  { text: "back pain", category: "symptom" },
  { text: "difficulty swallowing", category: "symptom" },
  { text: "palpitations", category: "symptom" },
  { text: "weight loss", category: "symptom" },
  { text: "night sweats", category: "symptom" },
  { text: "blurred vision", category: "symptom" },
  { text: "numbness", category: "symptom" },
  { text: "tingling", category: "symptom" },
  { text: "loss of appetite", category: "symptom" },
  { text: "blood in stool", category: "symptom" },
  { text: "blood in urine", category: "symptom" },
  { text: "chest tightness", category: "symptom" },
  { text: "wheezing", category: "symptom" },
  { text: "urinary frequency", category: "symptom" },
  { text: "CBC", category: "test" },
  { text: "X-ray chest", category: "test" },
  { text: "ECG", category: "test" },
  { text: "blood glucose", category: "test" },
  { text: "CT scan", category: "test" },
  { text: "MRI", category: "test" },
  { text: "urine analysis", category: "test" },
  { text: "dengue", category: "condition" },
  { text: "malaria", category: "condition" },
  { text: "typhoid", category: "condition" },
  { text: "pneumonia", category: "condition" },
  { text: "diabetes", category: "condition" },
  { text: "hypertension", category: "condition" },
  { text: "asthma", category: "condition" },
  { text: "tuberculosis", category: "condition" },
];

export const useTypingSuggestions = (input: string) => {
  const [suggestions, setSuggestions] = useState<QuickSuggestion[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!input || input.length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const words = input.toLowerCase().split(/[\s,]+/);
      const lastWord = words[words.length - 1];
      if (!lastWord || lastWord.length < 2) {
        setSuggestions([]);
        return;
      }

      const existing = new Set(words.slice(0, -1));
      const matches = SYMPTOM_DB
        .filter(
          (s) =>
            s.text.toLowerCase().includes(lastWord) &&
            !existing.has(s.text.toLowerCase())
        )
        .slice(0, 5);

      setSuggestions(matches);
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input]);

  return suggestions;
};
