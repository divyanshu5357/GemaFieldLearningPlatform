import { useEffect, useRef, useCallback } from "react";
import { ChatMessage } from "./chat-system";
import { supabase } from "./supabase";

/**
 * Hook for managing real-time chat subscriptions
 */
export const useChatSubscription = (
  currentUserId: string | null,
  selectedUserId: string | null,
  onMessageReceived: (message: ChatMessage) => void
) => {
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!currentUserId || !selectedUserId || selectedUserId === "ai-mentor") {
      return;
    }

    const subscription = supabase
      .channel(`chat:${currentUserId}:${selectedUserId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          // Only notify if this message is relevant to current conversation
          if (
            (newMessage.sender_id === currentUserId &&
              newMessage.receiver_id === selectedUserId) ||
            (newMessage.sender_id === selectedUserId &&
              newMessage.receiver_id === currentUserId)
          ) {
            onMessageReceived(newMessage);
          }
        }
      )
      .subscribe();

    unsubscribeRef.current = () => subscription.unsubscribe();

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [currentUserId, selectedUserId, onMessageReceived]);

  return unsubscribeRef;
};

/**
 * Hook for managing message count and XP awards
 */
export const useMessageCounterXP = (userId: string | null) => {
  const messageCountRef = useRef(0);

  const incrementAndCheckXP = useCallback(
    async (shouldAward: boolean = true) => {
      if (!userId) return;

      messageCountRef.current += 1;

      if (shouldAward && messageCountRef.current % 10 === 0) {
        try {
          // Award XP via RPC
          await supabase.rpc("add_xp", {
            user_id: userId,
            xp_amount: 5,
          });
        } catch (error) {
          console.warn("Could not award XP:", error);
        }
      }
    },
    [userId]
  );

  const reset = useCallback(() => {
    messageCountRef.current = 0;
  }, []);

  return { incrementAndCheckXP, reset, messageCount: messageCountRef.current };
};
