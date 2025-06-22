"use client";

import { MultimodalInput } from "@/components/MultimodalInput";
import { NearbyFoodsCards } from "@/components/NearbyFoodsCards";
import { useChat, Message } from "@ai-sdk/react";

export default function ChatPage() {
  const { messages, input, setInput, handleSubmit, status, error } = useChat({
    maxSteps: 5,
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === "getCurrentLocation") {
        return "Bukit Jalil, Kuala Lumpur, Malaysia"; // Hardcoded for demo purposes
      }
    },
  });

  const renderMessageContent = (content: string, parts: Message["parts"]) => {
    console.log("Rendering message content...");
    try {
      // Try to parse the content as JSON to check if it's structured data
      const parsed = JSON.parse(content);

      console.log("Parsed content:", parsed);

      // Check if it's our nearby foods data structure
      if (parsed.type === "nearby_foods") {
        return (
          <NearbyFoodsCards data={parsed} location={parsed.locationName} />
        );
      }
    } catch (e) {
      // If parsing fails, it's regular text content
    }

    console.log({parts})

    // Return regular text content
    return <p>{status === "streaming" ? "streaming..." : content}</p>;
  };

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
      <div className="flex-1 overflow-y-auto pt-4 pb-20 max-h-4/5">
        <div className="space-y-4">
          {messages.map((message) => {
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
                      ? "p-2 px-4 rounded-full size-fit bg-amber-300"
                      : isStructured
                      ? "w-full"
                      : "p-2 px-4 rounded-full"
                  }`}
                >
                  {isUserMessage ? (
                    <p>{message.content}</p>
                  ) : (
                    renderMessageContent(message.content, message.parts)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 my-16">
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
