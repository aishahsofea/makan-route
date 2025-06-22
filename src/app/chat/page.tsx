"use client";

import { MultimodalInput } from "@/components/MultimodalInput";
import { useChat } from "@ai-sdk/react";

export default function ChatPage() {
  const { messages, input, setInput, handleSubmit, status, error } = useChat({
    maxSteps: 5,
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === "getCurrentLocation") {
        return "Bukit Jalil, Kuala Lumpur, Malaysia"; // Hardcoded for demo purposes
      }
    },
  });

  console.log({ messages, status, error });

  return (
    <div className="relative w-full h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto px-16 pt-4 pb-20">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="p-4 rounded-lg border-1 border-zinc-700"
            >
              <p>{message.role === "user" ? "User: " : "AI: "}</p>
              <p className="text-sm">{message.content}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 my-16 bg-background ">
        <div className="max-w-4xl mx-auto">
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
