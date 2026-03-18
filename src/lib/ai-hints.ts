import { supabase } from "./supabase";

/**
 * Get AI hint for a lesson or challenge
 */
export async function getAIHint(
  lessonTitle: string,
  context: string,
  studentAnswer?: string
): Promise<{ success: boolean; hint?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("mega-llm", {
      body: {
        lessonTitle,
        context,
        studentAnswer,
        prompt: `You are an AI learning assistant. Provide a helpful, concise hint to guide the student.
        
Lesson: ${lessonTitle}
Context: ${context}
${studentAnswer ? `Student's attempt: ${studentAnswer}` : ""}

Provide a brief hint (2-3 sentences max) to help them learn.`,
      },
    });

    if (error) throw error;
    return { success: true, hint: data?.result || "Unable to generate hint" };
  } catch (error) {
    console.error("Error getting AI hint:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get hint",
    };
  }
}

/**
 * Log AI hint interaction
 */
export async function logAIHint(
  studentId: string,
  hintContext: string,
  hintResponse: string,
  lessonId?: string,
  challengeId?: string
): Promise<boolean> {
  try {
    const { error } = await supabase.from("ai_hints_log").insert([
      {
        student_id: studentId,
        lesson_id: lessonId || null,
        challenge_id: challengeId || null,
        hint_context: hintContext,
        hint_response: hintResponse,
      },
    ]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error logging AI hint:", error);
    return false;
  }
}

/**
 * Mark hint as helpful or not
 */
export async function rateHint(hintId: string, helpful: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("ai_hints_log")
      .update({ helpful })
      .eq("id", hintId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error rating hint:", error);
    return false;
  }
}

/**
 * Get AI hints statistics for a student
 */
export async function getHintStats(studentId: string) {
  try {
    const { data, error } = await supabase
      .from("ai_hints_log")
      .select("id, helpful")
      .eq("student_id", studentId);

    if (error) throw error;

    const hints = data || [];
    const totalHints = hints.length;
    const helpfulHints = hints.filter((h) => h.helpful === true).length;

    return {
      totalHints,
      helpfulHints,
      helpfulPercentage: totalHints > 0 ? Math.round((helpfulHints / totalHints) * 100) : 0,
    };
  } catch (error) {
    console.error("Error getting hint stats:", error);
    return { totalHints: 0, helpfulHints: 0, helpfulPercentage: 0 };
  }
}
