import { supabase } from "./supabase";

interface TopicScore {
  topic: string;
  score: number;
  count: number;
}

interface WeaknessAnalysis {
  weak_topics: TopicScore[];
  strong_topics: TopicScore[];
  areasForImprovement: string[];
}

/**
 * Analyze test results and identify weak areas
 */
export async function analyzeWeakAreas(
  studentId: string
): Promise<WeaknessAnalysis | null> {
  try {
    // Fetch all test results by topic for this student
    const { data: results, error } = await supabase
      .from("test_results_by_topic")
      .select("topic, score")
      .eq("student_id", studentId);

    if (error) throw error;
    if (!results || results.length === 0) {
      return null;
    }

    // Calculate average score per topic
    const topicStats = new Map<string, { scores: number[]; count: number }>();

    results.forEach((result: any) => {
      if (!topicStats.has(result.topic)) {
        topicStats.set(result.topic, { scores: [], count: 0 });
      }
      const stat = topicStats.get(result.topic)!;
      stat.scores.push(result.score);
      stat.count = stat.scores.length;
    });

    // Calculate average and categorize
    const topicScores: TopicScore[] = Array.from(topicStats.entries()).map(
      ([topic, stat]) => ({
        topic,
        score: Math.round(stat.scores.reduce((a, b) => a + b, 0) / stat.scores.length),
        count: stat.count,
      })
    );

    // Classify topics
    const weak_topics = topicScores.filter((t) => t.score < 40);
    const strong_topics = topicScores.filter((t) => t.score >= 70);
    const areasForImprovement = weak_topics.map((t) => t.topic);

    // Store in student_insights
    const analysis: WeaknessAnalysis = {
      weak_topics,
      strong_topics,
      areasForImprovement,
    };

    await supabase
      .from("student_insights")
      .upsert(
        [
          {
            student_id: studentId,
            weak_topics: weak_topics,
            strong_topics: strong_topics,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: "student_id" }
      );

    return analysis;
  } catch (error) {
    console.error("Error analyzing weak areas:", error);
    return null;
  }
}

/**
 * Store test results by topic
 */
export async function storeTestResultsByTopic(
  studentId: string,
  testId: string,
  testAttemptId: string,
  results: Array<{ topic: string; score: number; correct_answers?: number; total_questions?: number }>
): Promise<boolean> {
  try {
    const topicResults = results.map((r) => ({
      student_id: studentId,
      test_id: testId,
      test_attempt_id: testAttemptId,
      topic: r.topic,
      score: r.score,
      correct_answers: r.correct_answers || 0,
      total_questions: r.total_questions || 0,
    }));

    const { error } = await supabase.from("test_results_by_topic").insert(topicResults);

    if (error) throw error;

    // Run analysis after storing results
    await analyzeWeakAreas(studentId);

    return true;
  } catch (error) {
    console.error("Error storing test results by topic:", error);
    return false;
  }
}

/**
 * Get student's current insights
 */
export async function getStudentInsights(studentId: string): Promise<WeaknessAnalysis | null> {
  try {
    const { data, error } = await supabase
      .from("student_insights")
      .select("*")
      .eq("student_id", studentId)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      weak_topics: data.weak_topics || [],
      strong_topics: data.strong_topics || [],
      areasForImprovement: data.weak_topics?.map((t: any) => t.topic) || [],
    };
  } catch (error) {
    console.error("Error fetching student insights:", error);
    return null;
  }
}

/**
 * Get recommended lessons for weak topics
 */
export async function getRecommendedLessons(
  studentId: string,
  courseId?: string
): Promise<any[]> {
  try {
    const insights = await getStudentInsights(studentId);
    if (!insights || insights.weak_topics.length === 0) {
      return [];
    }

    const weakTopics = insights.weak_topics.map((t) => t.topic);

    // Fetch lessons that cover weak topics
    let query = supabase
      .from("lessons")
      .select("id, title, course_id, courses(title)")
      .or(`title.ilike.%${weakTopics[0]}%`);

    if (courseId) {
      query = query.eq("course_id", courseId);
    }

    const { data, error } = await query.limit(5);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error getting recommended lessons:", error);
    return [];
  }
}

/**
 * Check if student needs intervention in specific topic
 */
export function needsIntervention(topic: string, score: number): boolean {
  return score < 40; // Weak area
}

/**
 * Get performance trend for a topic
 */
export async function getTopicTrend(
  studentId: string,
  topic: string,
  limit: number = 5
): Promise<number[]> {
  try {
    const { data, error } = await supabase
      .from("test_results_by_topic")
      .select("score")
      .eq("student_id", studentId)
      .eq("topic", topic)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((r: any) => r.score);
  } catch (error) {
    console.error("Error getting topic trend:", error);
    return [];
  }
}
