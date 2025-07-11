"use client";

import { ConversationSidebar } from "@/components/ConversationSidebar";
import { MultimodalInput } from "@/components/MultimodalInput";
import { useConversation } from "@/hooks/useConversation";
import { getPlaceName } from "@/utils/getPlaceName";
import {
  renderMessagePart,
  renderMessageWithImages,
} from "@/utils/renderMessagePart";
import { Message, useChat } from "@ai-sdk/react";
import { useEffect, useState, FormEvent } from "react";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<any | null>(null);
  const [messageImages, setMessageImages] = useState<Map<string, any[]>>(
    new Map()
  );
  const {
    currentConversationId,
    userId,
    createNewConversation,
    loadConversationHistory,
    selectConversation,
  } = useConversation();
  const { messages, input, status, setInput, handleSubmit, setMessages } =
    useChat({
      id: currentConversationId, // <-- add this line to reset chat state per conversation
      maxSteps: 5,
      body: {
        conversationId: currentConversationId,
        userId,
      },
      onToolCall: async ({ toolCall }) => {
        if (toolCall.toolName === "getCurrentLocation") {
          return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              async (pos) => {
                const placeName = await getPlaceName(
                  pos.coords.latitude,
                  pos.coords.longitude
                );

                resolve(placeName);
              },
              (err) => resolve({ error: err.message })
            );
          });
        }
      },
    });

  // Load conversation history when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      loadConversationHistory(currentConversationId).then((history) => {
        if (history && history.length > 0) {
          setMessages(history as Message[]);
        } else {
          setMessages([]);
        }
      });
    }
  }, [currentConversationId, loadConversationHistory, setMessages]);

  // Wrap handleSubmit to ensure a conversation exists before sending a message
  const handleUserSubmit = async (e: FormEvent, images?: any[]) => {
    if (!currentConversationId) {
      setPendingMessage([e, images]);
      await createNewConversation();
    } else {
      e.preventDefault();

      if (!input.trim() && (!images || images.length === 0)) {
        return; // Don't submit empty messages
      }

      const messageContent = {
        text: input.trim(),
        images: images || [],
      };

      const userMessage = {
        role: "user" as const,
        content: messageContent,
      };

      // Create user message with unique ID
      const userMessageId = `user_${Date.now()}`;
      
      setMessages((prev) => [
        ...prev,
        {
          id: userMessageId,
          role: "user" as const,
          content: input.trim(),
          parts: [{ type: "text", text: input.trim() }],
        } as Message,
      ]);

      // Store images for display if they exist
      if (images && images.length > 0) {
        setMessageImages((prev) => new Map(prev).set(userMessageId, images));
      }

      setInput("");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [userMessage],
            conversationId: currentConversationId,
            userId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        let assistantMessage = "";
        const assistantMessageId = `assistant_${Date.now()}`;

        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: "assistant" as const,
            content: "",
            parts: [],
          } as Message,
        ]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("0:")) {
              // Extract the content after "0:"
              const data = line.slice(2);
              if (data && data.trim()) {
                try {
                  // Try to parse as JSON first
                  const parsed = JSON.parse(data);
                  // If it's a simple string, use it directly
                  if (typeof parsed === 'string') {
                    assistantMessage += parsed;
                  }
                } catch {
                  // If not JSON, treat as plain text
                  assistantMessage += data;
                }
              }
            }
          }

          // Update the message in real-time
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: assistantMessage,
                    parts: [{ type: "text", text: assistantMessage }],
                  }
                : msg
            )
          );
        }
      } catch (error) {
        console.error("Error sending message: ", error);

        setMessages((prev) => [
          ...prev,
          {
            id: `error_${Date.now()}`,
            role: "assistant" as const,
            content: "Sorry, I encountered an error. Please try again.",
            parts: [
              {
                type: "text",
                text: "Sorry, I encountered an error. Please try again.",
              },
            ],
          } as Message,
        ]);
      }
    }
  };

  // When currentConversationId is set and there is a pending message, send it
  useEffect(() => {
    if (currentConversationId && pendingMessage) {
      const [e, images] = pendingMessage;
      handleUserSubmit(e, images);
      setPendingMessage(null);
    }
  }, [currentConversationId, pendingMessage, handleUserSubmit]);

  const isStructuredContent = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      return parsed.type === "nearby_foods";
    } catch (e) {
      return false;
    }
  };

  const handleNewConversation = async () => {
    await createNewConversation();
    setSidebarOpen(false);
  };

  const handleConversationSelect = async (conversationId: string) => {
    selectConversation(conversationId);
    setSidebarOpen(false);
  };

  return (
    <div className="relative w-full h-screen flex">
      {/* Sidebar for desktop */}
      <div
        className={`hidden md:block fixed left-0 top-0 h-screen transition-all duration-300 z-30 ${
          sidebarCollapsed ? "w-8" : "w-80"
        }`}
      >
        <div className="relative h-full w-full flex flex-col">
          {!sidebarCollapsed ? (
            <>
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <ConversationSidebar
                  userId={userId}
                  currentConversationId={currentConversationId}
                  onConversationSelect={handleConversationSelect}
                  onNewConversation={handleNewConversation}
                />
              </div>
              <button
                className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-white border border-gray-200 rounded-full shadow p-1 z-40 hover:bg-gray-100 cursor-pointer"
                onClick={() => setSidebarCollapsed(true)}
                title="Collapse sidebar"
              >
                <ChevronLeft size={18} />
              </button>
            </>
          ) : (
            <button
              className="absolute top-1/2 left-1 transform -translate-y-1/2 bg-white border border-gray-200 rounded-full shadow p-1 z-40 hover:bg-gray-100 cursor-pointer"
              onClick={() => setSidebarCollapsed(false)}
              title="Expand sidebar"
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 flex md:hidden">
          <div className="h-full w-64 bg-white shadow-lg">
            <ConversationSidebar
              userId={userId}
              currentConversationId={currentConversationId}
              onConversationSelect={handleConversationSelect}
              onNewConversation={handleNewConversation}
            />
          </div>
          <div
            className="flex-1 bg-black bg-opacity-30"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main chat area */}
      <div
        className="relative flex flex-col flex-1 h-full transition-all duration-300 md:ml-8"
        style={{ marginLeft: sidebarCollapsed ? 32 : 320 }}
      >
        {/* Header */}
        <div
          style={{ backgroundColor: "var(--background)" }}
          className="sticky top-0 z-10 w-full border-b border-gray-200 px-4 py-3"
        >
          <div className="flex items-center justify-between md:justify-center">
            {/* Sidebar toggle button for mobile */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-2xl font-semibold text-gray-900 text-center flex-1">
              What's for Food? 🍝🍡🥗🍕
            </h1>
            <button
              style={{ backgroundColor: "var(--secondary)" }}
              className="ml-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium cursor-pointer hover:!bg-amber-400"
              onClick={handleNewConversation}
            >
              New chat
            </button>
          </div>
        </div>

        {/* Scrollable messages container */}
        <div
          className="flex-1 overflow-y-auto p-8 pb-40 scrollbar-hide"
          style={{ minHeight: 0 }}
        >
          <div className="space-y-4 px-4">
            {messages.map((message, index) => {
              const isUserMessage = message.role === "user";
              const isStructured = isStructuredContent(message.content);

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isUserMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`${
                      isUserMessage
                        ? "p-2 px-4 bg-amber-300 max-w-[80%] break-words rounded-lg"
                        : isStructured
                        ? "w-full"
                        : "p-2 px-4 max-w-[80%] break-words rounded-lg"
                    }`}
                  >
                    {isUserMessage ? (
                      renderMessageWithImages(
                        {
                          ...message,
                          content: messageImages.has(message.id)
                            ? {
                                text: message.content as string,
                                images: messageImages.get(message.id) || [],
                              }
                            : message.content,
                        },
                        index
                      )
                    ) : (
                      <>
                        {message.parts.map((part, index) =>
                          renderMessagePart(part, index)
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Input area */}
        <div
          className="sticky bottom-0 left-0 right-0 z-10 w-full flex justify-center p-6 pt-0"
          style={{ background: "var(--background)" }}
        >
          <div className="w-full mx-6">
            <MultimodalInput
              input={input}
              setInput={setInput}
              handleSubmit={handleUserSubmit}
              isDisabled={status !== "ready"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
