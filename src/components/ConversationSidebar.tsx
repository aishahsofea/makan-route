"use client";

import { Conversation } from "@/lib/ai/conversation";
import { Trash2, Plus, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";

interface ConversationSidebarProps {
  userId: string;
  currentConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  onNewConversation: () => void;
}

export const ConversationSidebar = (props: ConversationSidebarProps) => {
  const {
    userId,
    currentConversationId,
    onConversationSelect,
    onNewConversation,
  } = props;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/conversations?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setConversations(data.conversations);
      } else {
        console.error("Failed to fetch conversations:", data.error);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(
        `/api/conversations?userId=${userId}&conversationId=${conversationId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setConversations((prev) =>
          prev.filter((conv) => conv.id !== conversationId)
        );
      } else {
        console.error("Failed to delete conversation");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [userId, currentConversationId]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="w-80 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
          <button
            onClick={onNewConversation}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
            title="New conversation"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-2 text-gray-300" />
            <p>No conversations yet</p>
            <p className="text-sm">Start a new conversation to begin</p>
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                  currentConversationId === conversation.id
                    ? "bg-amber-100 border border-amber-200"
                    : "hover:bg-amber-100"
                }`}
                onClick={() => onConversationSelect(conversation.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {conversation.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(conversation.updatedAt)}
                    </p>
                    {conversation.messages.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1 truncate">
                        {conversation.messages[
                          conversation.messages.length - 1
                        ]?.content.slice(0, 50)}
                        {conversation.messages[conversation.messages.length - 1]
                          ?.content.length > 50 && "..."}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                    title="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
