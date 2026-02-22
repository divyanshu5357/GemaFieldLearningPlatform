import { supabase } from "./supabase";

/**
 * XP reward constants
 */
export const XP_REWARDS = {
  WATCH_LESSON: 10,
  COMPLETE_TEST: 50,
  CORRECT_ANSWER: 5,
  USE_AI_REVISION: 15,
  AI_CHALLENGE: 25,
  REVISION_QUEST: 20,
} as const;

/**
 * Calculate level from total XP
 * Level progression: 100 XP per level
 */
export function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / 100) + 1;
}

/**
 * Calculate XP needed to reach next level
 */
export function getXPForNextLevel(currentXP: number): number {
  const nextLevelXP = (calculateLevel(currentXP)) * 100;
  return nextLevelXP - currentXP;
}

/**
 * Get current level progress as percentage
 */
export function getLevelProgress(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP);
  const levelStartXP = (currentLevel - 1) * 100;
  const levelEndXP = currentLevel * 100;
  const progressInLevel = currentXP - levelStartXP;
  const levelDuration = levelEndXP - levelStartXP;
  return Math.round((progressInLevel / levelDuration) * 100);
}

/**
 * Add XP to a user and update their profile
 */
export async function addXP(
  userId: string,
  amount: number,
  reason?: string
): Promise<{ success: boolean; newXP: number; newLevel: number; error?: string }> {
  try {
    // Get current XP
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("xp, level")
      .eq("id", userId)
      .single();

    if (fetchError) throw fetchError;

    const currentXP = profile?.xp || 0;
    const newXP = currentXP + amount;
    const newLevel = calculateLevel(newXP);

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        xp: newXP,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) throw updateError;

    // Log XP transaction for analytics (optional)
    if (reason) {
      try {
        await supabase.from("xp_transactions").insert([
          {
            user_id: userId,
            amount,
            reason,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        console.warn("Failed to log XP transaction:", err);
      }
    }

    return { success: true, newXP, newLevel };
  } catch (error) {
    console.error("Error adding XP:", error);
    return {
      success: false,
      newXP: 0,
      newLevel: 1,
      error: error instanceof Error ? error.message : "Failed to add XP",
    };
  }
}

/**
 * Get user's XP and level
 */
export async function getUserXP(userId: string): Promise<{
  xp: number;
  level: number;
  progress: number;
  nextLevelXP: number;
}> {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("xp, level")
      .eq("id", userId)
      .single();

    if (error) throw error;

    const xp = profile?.xp || 0;
    const level = calculateLevel(xp);
    const progress = getLevelProgress(xp);
    const nextLevelXP = getXPForNextLevel(xp);

    return { xp, level, progress, nextLevelXP };
  } catch (error) {
    console.error("Error fetching user XP:", error);
    return { xp: 0, level: 1, progress: 0, nextLevelXP: 100 };
  }
}

/**
 * Check if user leveled up
 */
export function didLevelUp(oldXP: number, newXP: number): boolean {
  return calculateLevel(oldXP) < calculateLevel(newXP);
}
