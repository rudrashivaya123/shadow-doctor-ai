import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are an advanced clinical decision support AI trained on standard textbooks (Harrison's Principles of Internal Medicine, Davidson's Principles and Practice of Medicine, Nelson Textbook of Pediatrics) and WHO/ICMR guidelines.

Your role:
- Assist doctors by providing a structured second opinion
- Identify missed diagnoses and dangerous conditions early
- Highlight emergency situations that require immediate action

Rules:
- Be concise and precise
- Prioritize life-threatening conditions and patient safety above all
- Do NOT over-diagnose — only include clinically relevant differentials
- Consider epidemiological context and patient demographics
- Provide clinical reasoning for your assessment
- Flag time-sensitive conditions that require urgent action

You MUST respond by calling the provided tool with structured clinical data. Never return plain text.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms, notes, language } = await req.json();

    if (!symptoms || typeof symptoms !== "string" || symptoms.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Symptoms are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const langLabel = language === "hi" ? "Hindi" : language === "mr" ? "Marathi" : "English";

    const userPrompt = `Patient symptoms: ${symptoms}
Doctor notes: ${notes || "None provided"}
Language preference: ${langLabel}

Analyze this consultation. Identify the primary diagnosis, rank differentials, assign an emergency level, and provide immediate management, investigations, treatment plan, red flags, missed possibilities, and clinical reasoning. If the language preference is Hindi or Marathi, provide the output in that language.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "clinical_analysis",
              description: "Return structured clinical decision support data",
              parameters: {
                type: "object",
                properties: {
                  primary_diagnosis: {
                    type: "string",
                    description: "The most likely primary diagnosis with brief reasoning",
                  },
                  differentials: {
                    type: "array",
                    items: { type: "string" },
                    description: "Ranked differential diagnoses (top 3-5)",
                  },
                  emergency_level: {
                    type: "string",
                    enum: ["Low", "Moderate", "HIGH RISK"],
                    description: "Emergency triage level",
                  },
                  immediate_management: {
                    type: "array",
                    items: { type: "string" },
                    description: "Immediate life-saving management steps",
                  },
                  investigations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Recommended lab tests and investigations",
                  },
                  treatment: {
                    type: "array",
                    items: { type: "string" },
                    description: "Treatment plan steps",
                  },
                  red_flags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Critical warning signs to watch for",
                  },
                  missed_possibilities: {
                    type: "array",
                    items: { type: "string" },
                    description: "Conditions that might be overlooked",
                  },
                  reasoning: {
                    type: "string",
                    description: "Clinical reasoning explaining the assessment",
                  },
                },
                required: [
                  "primary_diagnosis",
                  "differentials",
                  "emergency_level",
                  "immediate_management",
                  "investigations",
                  "treatment",
                  "red_flags",
                  "missed_possibilities",
                  "reasoning",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "clinical_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway returned ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error("No structured response from AI");
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-consultation error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
