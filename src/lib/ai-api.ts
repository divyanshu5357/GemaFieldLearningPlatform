import { supabase } from "../lib/supabase";

// Get API keys from environment
const GROQ_API_KEY = (import.meta as any).env.VITE_GROQ_API_KEY;

/**
 * Call Groq API directly from frontend (Free & Unlimited!)
 */
async function callGroq(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("Groq API key not configured");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: systemPrompt || "You are a helpful assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Groq API error: ${error.error?.message || "Unknown error"}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Parse JSON from LLM response
 */
function parseJSONFromText(text: string): Record<string, any> {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {};
  } catch {
    return {};
  }
}

/**
 * Call the OpenAI API for revision notes
 */
export async function generateRevisionNotes(
  lessonTitle: string,
  description: string,
  transcript?: string
): Promise<{
  summary?: string;
  key_points?: string[];
  quick_revision_notes?: string;
  error?: string;
}> {
  try {
    if (!GROQ_API_KEY) {
      return { error: "Groq API key not configured. Please add VITE_GROQ_API_KEY to your .env file" };
    }

    const systemPrompt = `You are an expert web development instructor. Create concise, student-friendly revision notes.
Format your response as JSON with these fields:
{
  "summary": "1-2 sentence overview",
  "key_points": ["point 1", "point 2", "point 3"],
  "quick_revision_notes": "Bullet-point format revision notes"
}`;

    const content = `Lesson: ${lessonTitle}
Description: ${description}
${transcript ? `Transcript/URL: ${transcript}` : ""}

Create revision notes for this lesson.`;

    console.log('Calling Groq for revision notes...');
    const response = await callGroq(content, systemPrompt);
    console.log('Groq Response:', response);
    
    const parsed = parseJSONFromText(response);

    return {
      summary: parsed.summary as string,
      key_points: parsed.key_points as string[],
      quick_revision_notes: parsed.quick_revision_notes as string,
    };
  } catch (err) {
    console.error("Revision notes error:", err);
    return { error: err instanceof Error ? err.message : "Failed to generate revision notes" };
  }
}

/**
 * Call the OpenAI API for performance analysis
 */
export async function analyzeStudentPerformance(
  testResults: Record<string, number>
): Promise<{
  weak_topics?: string[];
  improvement_suggestions?: string[];
  next_learning_steps?: string[];
  error?: string;
}> {
  try {
    if (!GROQ_API_KEY) {
      return { error: "Groq API key not configured. Please add VITE_GROQ_API_KEY to your .env file" };
    }

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

    console.log('Calling Groq for performance analysis...');
    const response = await callGroq(content, systemPrompt);
    console.log('Performance Analysis Response:', response);
    
    const parsed = parseJSONFromText(response);

    return {
      weak_topics: parsed.weak_topics as string[],
      improvement_suggestions: parsed.improvement_suggestions as string[],
      next_learning_steps: parsed.next_learning_steps as string[],
    };
  } catch (err) {
    console.error("Performance analysis error:", err);
    return { error: err instanceof Error ? err.message : "Failed to analyze performance" };
  }
}


export async function askAIMentor(
  question: string,
  lessonTitle?: string,
  courseTitle?: string
): Promise<string> {
  try {
    if (!GROQ_API_KEY) {
      throw new Error("Groq API key not configured. Please add VITE_GROQ_API_KEY to your .env file");
    }

    const systemPrompt = `You are an expert coding mentor helping students understand lesson videos clearly.
- Give short, simple answers (2-3 sentences max)
- Be encouraging and supportive
- Focus on the lesson content: ${lessonTitle || "the current lesson"} (from ${courseTitle || "the course"})
- Ask clarifying questions if the question is unclear`;

    console.log('Calling Groq for mentor chat...');
    const response = await callGroq(question, systemPrompt);
    console.log('Mentor Chat Response:', response);

    return response.trim();
  } catch (err) {
    console.error("Mentor chat error:", err);
    throw err instanceof Error ? err : new Error("Failed to get mentor response");
  }
}

/**
 * Analyze student performance and identify weak points
 */
export async function analyzeStudentWeakPoints(
  studentId: string,
  testId: string,
  score: number,
  correctAnswers: string[],
  wrongAnswers: string[],
  topics: string[]
): Promise<{
  level?: string;
  weakTopics?: string[];
  suggestions?: string;
  error?: string;
}> {
  try {
    if (!GROQ_API_KEY) {
      return { error: "Groq API key not configured" };
    }

    const systemPrompt = `You are an expert learning analyst. Analyze student performance and provide constructive feedback.
Categorize the performance level as: Weak, Average, Good, or Excellent.
Return ONLY valid JSON with no extra text.`;

    const content = `
Student Performance Analysis:
- Score: ${score}%
- Correct Answers: ${correctAnswers.length}
- Wrong Answers: ${wrongAnswers.length}
- Topics Covered: ${topics.join(", ")}
- Wrong Topics: ${wrongAnswers.join(", ")}

Provide analysis in JSON format:
{
  "level": "Weak|Average|Good|Excellent",
  "weakTopics": ["topic1", "topic2"],
  "suggestions": "Brief improvement suggestions"
}
    `.trim();

    console.log("Calling Groq for performance analysis...");
    const response = await callGroq(content, systemPrompt);
    console.log("Performance Analysis Response:", response);

    const parsed = parseJSONFromText(response);

    // Save to database
    const { error } = await supabase.from("student_analytics").insert([
      {
        student_id: studentId,
        test_id: testId,
        score,
        level: parsed.level || "Average",
        weak_topics: parsed.weakTopics || [],
        ai_feedback: parsed.suggestions || "",
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;

    return {
      level: parsed.level as string,
      weakTopics: parsed.weakTopics as string[],
      suggestions: parsed.suggestions as string,
    };
  } catch (err) {
    console.error("Performance analysis error:", err);
    return { error: err instanceof Error ? err.message : "Failed to analyze performance" };
  }
}

/**
 * Fetch student test results for analysis
 */
export async function fetchStudentTestResults(userId: string): Promise<Record<string, number>> {
  try {
    const { data, error } = await supabase
      .from("test_attempts")
      .select("tests(title), score")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;

    // Aggregate scores by test topic
    const results: Record<string, number[]> = {};

    data?.forEach((attempt: any) => {
      const topic = attempt.tests?.title || "General";
      if (!results[topic]) results[topic] = [];
      results[topic].push(attempt.score);
    });

    // Calculate average for each topic
    const averages: Record<string, number> = {};
    Object.entries(results).forEach(([topic, scores]) => {
      averages[topic] = Math.round(
        scores.reduce((a, b) => a + b, 0) / scores.length
      );
    });

    return averages;
  } catch (err) {
    console.error("Error fetching test results:", err);
    return {};
  }
}

/**
 * Save chat message to database for history
 */
export async function saveChatMessage(
  studentId: string,
  lessonId: string,
  message: string,
  role: "user" | "ai"
): Promise<boolean> {
  try {
    const { error } = await supabase.from("ai_messages").insert([
      {
        student_id: studentId,
        lesson_id: lessonId,
        message,
        role,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Error saving chat message:", err);
    return false;
  }
}

/**
 * Fetch chat history for a lesson
 */
export async function fetchChatHistory(
  lessonId: string,
  studentId: string,
  limit: number = 50
): Promise<Array<{ role: "user" | "ai"; content: string; timestamp: string }>> {
  try {
    const { data, error } = await supabase
      .from("ai_messages")
      .select("message, role, created_at")
      .eq("lesson_id", lessonId)
      .eq("student_id", studentId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) throw error;

    return (
      data?.map((msg: any) => ({
        role: msg.role,
        content: msg.message,
        timestamp: msg.created_at,
      })) || []
    );
  } catch (err) {
    console.error("Error fetching chat history:", err);
    return [];
  }
}
