"use client";

import { ChangeEventHandler, useRef } from "react";
import { Textarea } from "@heroui/react";
import { UseChatHelpers } from "@ai-sdk/react";

type MultimodalInputProps = {
  input: UseChatHelpers["input"];
  isDisabled: boolean;
  setInput: UseChatHelpers["setInput"];
  handleSubmit: UseChatHelpers["handleSubmit"];
};

export const MultimodalInput = ({
  input,
  isDisabled,
  setInput,
  handleSubmit,
}: MultimodalInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (value: string) => {
    console.log("Input changed:", value);
    setInput(value);
  };

  return (
    <Textarea
      ref={textareaRef}
      isDisabled={isDisabled}
      className="min-h-[24px] max-h-[calc(75dvh)] border-1 border-zinc-700 overflow-hidden resize-none rounded-xl"
      placeholder="Send a message..."
      value={input}
      onValueChange={handleInput}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          handleSubmit();
        }
      }}
    />
  );
};
