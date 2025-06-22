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
    setInput(value);
  };

  return (
    <Textarea
      ref={textareaRef}
      isDisabled={isDisabled}
      className="min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl"
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
