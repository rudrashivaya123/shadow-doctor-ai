import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are an advanced medical imaging AI trained on dermatology atlases (Fitzpatrick's, Andrews') and radiology textbooks (Grainger & Allison, Sutton's). You assist doctors by analyzing clinical images.

Rules:
- Be concise and precise
- Prioritize life-threatening conditions
- Do NOT over-diagnose
- Provide confidence levels as percentages (0-100)
- Consider patient context when provided
- Flag urgent findings immediately

Analyze the provided medical image and return structured diagnostic data using the tool provided.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType, context, language } = await req.json();

    if (!imageBase64 || !mimeType) {
      return new Response(JSON.stringify({ error: "Image is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const langLabel = language === "hi" ? "Hindi" : language === "mr" ? "Marathi" : "English";

    const userPrompt = `Clinical context: ${context || "None provided"}
Language preference: ${langLabel}

Analyze this medical image. Identify possible diagnoses with confidence levels, key visual findings, diagnostic criteria (matched and missing), red flags, urgency level, suggested tests, and next steps. If the language preference is Hindi or Marathi, provide the output in that language.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${imageBase64}` },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "image_diagnosis",
              description: "Return structured image-based diagnostic data",
              parameters: {
                type: "object",
                properties: {
                  ai_summary: {
                    type: "string",
                    description: "Concise clinical summary of the image findings",
                  },
                  possible_diagnoses: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        confidence: { type: "number", description: "Confidence 0-100" },
                        description: { type: "string" },
                      },
                      required: ["name", "confidence", "description"],
                      additionalProperties: false,
                    },
                  },
                  key_visual_findings: {
                    type: "array",
                    items: { type: "string" },
                  },
                  diagnostic_criteria: {
                    type: "object",
                    properties: {
                      matched: { type: "array", items: { type: "string" } },
                      missing: { type: "array", items: { type: "string" } },
                    },
                    required: ["matched", "missing"],
                    additionalProperties: false,
                  },
                  red_flags: {
                    type: "array",
                    items: { type: "string" },
                  },
                  urgency_level: {
                    type: "string",
                    enum: ["Low", "Moderate", "HIGH RISK"],
                  },
                  suggested_tests: {
                    type: "array",
                    items: { type: "string" },
                  },
                  next_steps: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: [
                  "ai_summary",
                  "possible_diagnoses",
                  "key_visual_findings",
                  "diagnostic_criteria",
                  "red_flags",
                  "urgency_level",
                  "suggested_tests",
                  "next_steps",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "image_diagnosis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait and try again." }),
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
    console.error("analyze-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
