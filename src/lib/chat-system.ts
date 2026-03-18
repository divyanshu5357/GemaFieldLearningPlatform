import { supabase } from "./supabase";

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
}

export interface Teacher {
  id: string;
  name: string;
  avatar_url?: string;
}

/**
 * Fetch all teachers from the database
 */
export const fetchTeachers = async (): Promise<Teacher[]> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .eq("role", "teacher");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return [];
  }
};

/**
 * Fetch chat messages between two users
 */
export const fetchChatMessages = async (
  userId: string,
  otherUserId: string
): Promise<ChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  }
};

/**
 * Send a chat message
 */
export const sendChatMessage = async (
  senderId: string,
  receiverId: string,
  message: string
): Promise<ChatMessage | null> => {
  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        sender_id: senderId,
        receiver_id: receiverId,
        message: message,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
};

/**
 * Call AI Mentor (mega-llm edge function)
 */
export const callAIMentor = async (prompt: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke("mega-llm", {
      body: { message: prompt },
    });

    if (error) throw error;
    return data?.response || "I'm thinking about your question...";
  } catch (error) {
    console.error("Error calling AI mentor:", error);
    return "Sorry, I encountered an error processing your request.";
  }
};

/**
 * Subscribe to real-time chat messages
 */
export const subscribeToMessages = (
  onInsert: (message: ChatMessage) => void
): (() => void) => {
  const subscription = supabase
    .channel("chat")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
      },
      (payload) => {
        onInsert(payload.new as ChatMessage);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
};

/**
 * Award XP to user (call via edge function or database function)
 */
export const awardXP = async (userId: string, xpAmount: number): Promise<boolean> => {
  try {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) return false;

    // Call edge function or use RPC to update XP
    const { error } = await supabase.rpc("add_xp", {
      user_id: userId,
      xp_amount: xpAmount,
    });

    if (error) {
      console.warn("XP award skipped (function may not exist):", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error awarding XP:", error);
    return false;
  }
};

/**
 * Get current user profile
 */
export const getCurrentUserProfile = async () => {
  try {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) return null;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.user.id)
      .single();

    if (error) throw error;
    return profile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};
