import { Conversation, ConversationMessage } from "@/lib/ai/conversation";
import { useCallback, useState } from "react";

const LOCAL_STORAGE_KEY = "makan_route_user_id";

export const useConversation = () => {
  const [currentConversationId, setCurrentConversationId] = useState<
    string | undefined
  >();
  const [userId] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) return stored;

      const newUserId = `user_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 15)}`;
      localStorage.setItem(LOCAL_STORAGE_KEY, newUserId);
    }
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  });

  const createNewConversation = useCallback(async () => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const { conversation } = await response.json();
        setCurrentConversationId(conversation.id);
        return conversation;
      }
    } catch (error) {
      console.error(`Error creating conversation: ${error}`);
    }
  }, [userId]);

  const selectConversation = useCallback((conversationId: string) => {
    setCurrentConversationId(conversationId);
  }, []);

  const clearCurrentConversationId = useCallback(() => {
    setCurrentConversationId(undefined);
  }, []);

  const loadConversationHistory = useCallback(
    async (conversationId: string) => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}`);

        if (response.ok) {
          const { conversation }: { conversation: Conversation } =
            await response.json();
          return conversation.messages.map((message: ConversationMessage) => ({
            id: `${message.timestamp}_${message.role}`,
            role: message.role,
            content: message.content,
            parts: [
              {
                type: "text",
                text: message.content,
              },
            ],
          }));
        }
      } catch (error) {
        console.error(`Error loading conversation history: ${error}`);
        return [];
      }
    },
    []
  );

  return {
    currentConversationId,
    userId,
    createNewConversation,
    selectConversation,
    clearCurrentConversationId,
    loadConversationHistory,
  };
};
