import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const specialtyContext: Record<string, string> = {
  general: "You are consulting in a General Practice / Internal Medicine context. Consider common adult presentations, chronic diseases, and tropical infections prevalent in the Indian subcontinent.",
  pediatrics: "You are consulting in a Pediatric context. Consider age-appropriate differentials, growth milestones, pediatric dosing, neonatal conditions, and childhood infections. Reference Nelson Textbook of Pediatrics.",
  orthopedics: "You are consulting in an Orthopedic context. Focus on musculoskeletal complaints, fracture patterns, joint pathology, soft tissue injuries, and post-operative complications.",
};

function buildToolParams(learningMode: boolean) {
  const params: Record<string, any> = {
    type: "object",
    properties: {
      primary_diagnosis: { type: "string", description: "Most likely primary diagnosis with brief reasoning" },
      differentials: { type: "array", items: { type: "string" }, description: "Ranked differential diagnoses (top 3-5)" },
      emergency_level: { type: "string", enum: ["Low", "Moderate", "HIGH RISK"], description: "Emergency triage level" },
      risk_score: { type: "number", description: "Numeric risk score from 0 (safe) to 100 (critical)" },
      immediate_management: { type: "array", items: { type: "string" }, description: "Immediate life-saving management steps" },
      investigations: { type: "array", items: { type: "string" }, description: "Recommended lab tests and investigations" },
      treatment: { type: "array", items: { type: "string" }, description: "Treatment plan steps" },
      red_flags: { type: "array", items: { type: "string" }, description: "Critical warning signs to watch for" },
      missed_possibilities: { type: "array", items: { type: "string" }, description: "Conditions that might be overlooked" },
      reasoning: { type: "string", description: "Clinical reasoning explaining the assessment" },
    },
    required: ["primary_diagnosis", "differentials", "emergency_level", "risk_score", "immediate_management", "investigations", "treatment", "red_flags", "missed_possibilities", "reasoning"],
    additionalProperties: false,
  };

  if (learningMode) {
    params.properties.learning_explanations = {
      type: "array",
      items: {
        type: "object",
        properties: {
          diagnosis: { type: "string" },
          explanation: { type: "string", description: "Educational explanation with pathophysiology and key features" },
        },
        required: ["diagnosis", "explanation"],
        additionalProperties: false,
      },
      description: "Educational explanations for each considered diagnosis",
    };
    params.properties.clinical_insights = {
      type: "array",
      items: { type: "string" },
      description: "Key clinical insights: differentiating features between similar conditions, important lab value interpretations, textbook pearls",
    };
    params.properties.common_mistakes = {
      type: "array",
      items: { type: "string" },
      description: "Common mistakes doctors make in similar cases and how to avoid them",
    };
    params.required.push("learning_explanations", "clinical_insights", "common_mistakes");
  }

  return params;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptoms, notes, language, specialty, learningMode } = await req.json();

    if (!symptoms || typeof symptoms !== "string" || symptoms.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Symptoms are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langLabel = language === "hi" ? "Hindi" : language === "mr" ? "Marathi" : "English";
    const specContext = specialtyContext[specialty || "general"] || specialtyContext.general;

    const learningInstructions = learningMode
      ? `- LEARNING MODE ACTIVE: For each differential and primary diagnosis, provide educational explanations with pathophysiology, key distinguishing features, and textbook references.
- Provide clinical insights: key differentiating points between similar conditions (e.g. Dengue vs Chikungunya), important lab interpretations.
- List common mistakes doctors make in similar presentations and how to avoid them.`
      : "";

    const systemPrompt = `You are an advanced clinical decision support AI trained on standard textbooks (Harrison's, Davidson's, Nelson) and WHO/ICMR guidelines.

${specContext}

Your role:
- Assist doctors by providing a structured second opinion
- Identify missed diagnoses and dangerous conditions early
- Highlight emergency situations requiring immediate action
- Assign a numeric risk score (0-100) based on symptom severity and urgency

Rules:
- Be concise and precise
- Prioritize life-threatening conditions and patient safety
- Do NOT over-diagnose
- Consider epidemiological context and patient demographics
- Provide clinical reasoning for your assessment
- Flag time-sensitive conditions
${learningInstructions}

You MUST respond by calling the provided tool with structured clinical data. Never return plain text.`;

    const userPrompt = `Patient symptoms: ${symptoms}
Doctor notes: ${notes || "None provided"}
Language preference: ${langLabel}
Specialty context: ${specialty || "general"}

Analyze this consultation.${learningMode ? " Include learning explanations, clinical insights, and common mistakes." : ""} If the language preference is Hindi or Marathi, provide the output in that language.`;

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
        tools: [{
          type: "function",
          function: {
            name: "clinical_analysis",
            description: "Return structured clinical decision support data",
            parameters: buildToolParams(!!learningMode),
          },
        }],
        tool_choice: { type: "function", function: { name: "clinical_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway returned ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) throw new Error("No structured response from AI");

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
