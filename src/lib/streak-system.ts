import { supabase } from "./supabase";

/**
 * Check if user has active session today
 */
function isToday(date: string | null): boolean {
  if (!date) return false;
  const lastActive = new Date(date);
  const today = new Date();
  return (
    lastActive.getDate() === today.getDate() &&
    lastActive.getMonth() === today.getMonth() &&
    lastActive.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is yesterday
 */
function isYesterday(date: string | null): boolean {
  if (!date) return false;
  const lastActive = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return (
    lastActive.getDate() === yesterday.getDate() &&
    lastActive.getMonth() === yesterday.getMonth() &&
    lastActive.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Update user's streak on login
 */
export async function updateStreak(userId: string): Promise<{
  success: boolean;
  streakCount: number;
  streakIncremented: boolean;
  error?: string;
}> {
  try {
    // Get current profile data
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("last_active_date, streak_count")
      .eq("id", userId)
      .single();

    if (fetchError) throw fetchError;

    const lastActiveDate = profile?.last_active_date;
    const currentStreak = profile?.streak_count || 0;
    const today = new Date().toISOString().split("T")[0];

    let newStreak = currentStreak;
    let streakIncremented = false;

    // If user was active yesterday, increment streak
    if (isYesterday(lastActiveDate)) {
      newStreak = currentStreak + 1;
      streakIncremented = true;
    }
    // If user is not active today and wasn't yesterday, reset
    else if (!isToday(lastActiveDate)) {
      newStreak = 1; // Start new streak
      streakIncremented = true;
    }

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        last_active_date: today,
        streak_count: newStreak,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) throw updateError;

    return {
      success: true,
      streakCount: newStreak,
      streakIncremented,
    };
  } catch (error) {
    console.error("Error updating streak:", error);
    return {
      success: false,
      streakCount: 0,
      streakIncremented: false,
      error: error instanceof Error ? error.message : "Failed to update streak",
    };
  }
}

/**
 * Get user's current streak
 */
export async function getUserStreak(userId: string): Promise<{
  streakCount: number;
  lastActiveDate: string | null;
  isActiveToday: boolean;
}> {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("streak_count, last_active_date")
      .eq("id", userId)
      .single();

    if (error) throw error;

    const streakCount = profile?.streak_count || 0;
    const lastActiveDate = profile?.last_active_date || null;
    const isActiveToday = isToday(lastActiveDate);

    return { streakCount, lastActiveDate, isActiveToday };
  } catch (error) {
    console.error("Error fetching streak:", error);
    return { streakCount: 0, lastActiveDate: null, isActiveToday: false };
  }
}

/**
 * Get streak status message
 */
export function getStreakMessage(streakCount: number): string {
  if (streakCount === 0) return "Start your learning streak!";
  if (streakCount === 1) return "🔥 Just started!";
  if (streakCount < 7) return `🔥 ${streakCount} day streak!`;
  if (streakCount < 30) return `🔥 ${streakCount} days! Keep going!`;
  if (streakCount < 100) return `🔥 ${streakCount} days! On fire!`;
  return `🔥 ${streakCount} days! Legendary streak!`;
}

/**
 * Get streak milestone status
 */
export function getStreakMilestone(
  streakCount: number
): "none" | "bronze" | "silver" | "gold" | "platinum" {
  if (streakCount === 0) return "none";
  if (streakCount < 7) return "bronze";
  if (streakCount < 30) return "silver";
  if (streakCount < 100) return "gold";
  return "platinum";
}
