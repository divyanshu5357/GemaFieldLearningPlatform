import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface MegaLLMRequest {
  type: "revision" | "analysis" | "mentor";
  content: string;
  systemPrompt?: string;
  lessonTitle?: string;
  description?: string;
  apiKey: string; // API key from frontend
}

interface MegaLLMResponse {
  success: boolean;
  data?: {
    summary?: string;
    key_points?: string[];
    quick_revision_notes?: string;
    weak_topics?: string[];
    improvement_suggestions?: string[];
    next_learning_steps?: string[];
    response?: string;
  };
  error?: string;
}

const MEGA_LLM_BASE_URL = "https://api.together.ai/inference";

async function callMegaLLM(
  prompt: string,
  apiKey: string,
  systemPrompt?: string
): Promise<string> {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  const response = await fetch(MEGA_LLM_BASE_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistralai/Mistral-7B-Instruct-v0.1",
      max_tokens: 1024,
      prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
      temperature: 0.7,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Mega LLM API error: ${error.error || "Unknown error"}`);
  }

  const data = await response.json();
  return data.output?.choices?.[0]?.text || "";
}

function parseJSONFromText(text: string): Record<string, unknown> {
  try {
    // Try to find JSON block in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {};
  } catch {
    return {};
  }
}

async function generateRevisionNotes(
  lessonTitle: string,
  description: string,
  transcript: string | undefined,
  apiKey: string
): Promise<MegaLLMResponse> {
  try {
    const systemPrompt = `You are an expert web development instructor. Create concise, student-friendly revision notes.
Format your response as JSON with these fields:
{
  "summary": "1-2 sentence overview",
  "key_points": ["point 1", "point 2", "point 3"],
  "quick_revision_notes": "Bullet-point format revision notes"
}`;

    const content = `Lesson: ${lessonTitle}
Description: ${description}
${transcript ? `Transcript: ${transcript}` : ""}

Create revision notes for this lesson.`;

    const response = await callMegaLLM(content, apiKey, systemPrompt);
    const parsed = parseJSONFromText(response);

    return {
      success: true,
      data: {
        summary: parsed.summary as string,
        key_points: parsed.key_points as string[],
        quick_revision_notes: parsed.quick_revision_notes as string,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate revision notes",
    };
  }
}

async function analyzeWeakTopics(
  testResults: Record<string, number>,
  apiKey: string
): Promise<MegaLLMResponse> {
  try {
    const systemPrompt = `You are an expert learning analyst. Analyze student performance and provide constructive feedback.
Format your response as JSON:
{
  "weak_topics": ["topic 1", "topic 2"],
  "improvement_suggestions": ["suggestion 1", "suggestion 2"],
  "next_learning_steps": ["step 1", "step 2"]
}`;

    const resultsText = Object.entries(testResults)
      .map(([topic, score]) => `${topic}: ${score}%`)
      .join("\n");

    const content = `Student test results:\n${resultsText}\n\nProvide personalized improvement advice.`;

    const response = await callMegaLLM(content, apiKey, systemPrompt);
    const parsed = parseJSONFromText(response);

    return {
      success: true,
      data: {
        weak_topics: parsed.weak_topics as string[],
        improvement_suggestions: parsed.improvement_suggestions as string[],
        next_learning_steps: parsed.next_learning_steps as string[],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to analyze performance",
    };
  }
}

async function mentorChat(question: string, apiKey: string): Promise<MegaLLMResponse> {
  try {
    const systemPrompt = `You are a friendly, patient web development mentor. Explain concepts clearly and simply.
Answer questions in 2-3 sentences maximum. Be encouraging and supportive.`;

    const response = await callMegaLLM(question, apiKey, systemPrompt);

    return {
      success: true,
      data: {
        response: response.trim(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process mentor request",
    };
  }
}

serve(async (req: Request) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  try {
    const requestBody = await req.json() as MegaLLMRequest;
    const { type, content, systemPrompt, lessonTitle, description, apiKey } = requestBody;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "API key is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    let response: MegaLLMResponse;

    switch (type) {
      case "revision":
        response = await generateRevisionNotes(
          lessonTitle || "",
          description || "",
          content,
          apiKey
        );
        break;

      case "analysis":
        try {
          const testResults = JSON.parse(content);
          response = await analyzeWeakTopics(testResults, apiKey);
        } catch {
          response = {
            success: false,
            error: "Invalid test results format",
          };
        }
        break;

      case "mentor":
        response = await mentorChat(content, apiKey);
        break;

      default:
        response = {
          success: false,
          error: "Invalid request type",
        };
    }

    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
      },
      status: response.success ? 200 : 400,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, x-client-info, apikey",
        },
      }
    );
  }
});
