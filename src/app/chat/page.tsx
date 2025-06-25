"use client";

import { MultimodalInput } from "@/components/MultimodalInput";
import { getPlaceName } from "@/utils/getPlaceName";
import { renderMessagePart } from "@/utils/renderMessagePart";
import { useChat } from "@ai-sdk/react";

export default function ChatPage() {
  const { messages, input, setInput, handleSubmit, status, error } = useChat({
    maxSteps: 5,
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

  const isStructuredContent = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      return parsed.type === "nearby_foods";
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col max-w-3xl">
      <div
        style={{ backgroundColor: "var(--background)" }}
        className="flex-none  border-b border-gray-200 px-4 py-3 sticky top-0 z-10"
      >
        <h1 className="text-2xl font-semibold text-gray-900 text-center">
          What's for Food? 🍝🍡🥗🍕
        </h1>
      </div>

      {/* Scrollable messages container */}
      <div className="flex-1 overflow-y-auto pt-4 pb-40 scrollbar-hide">
        <div className="space-y-4 px-4">
          {messages.map((message, index) => {
            const isUserMessage = message.role === "user";
            const isAiMessage = message.role === "assistant";
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
                    <p className="whitespace-pre-wrap">{message.content}</p>
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

      <div
        style={{ backgroundColor: "var(--background)" }}
        className="fixed bottom-0 left-0 right-0 p-4 py-8 h-40"
      >
        <div className="max-w-3xl mx-auto">
          <MultimodalInput
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isDisabled={status !== "ready"}
          />
        </div>
      </div>
    </div>
  );
}
