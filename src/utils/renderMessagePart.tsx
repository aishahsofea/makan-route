import { NearbyFoodsCards } from "@/components/NearbyFoodsCards";
import { parseText } from "./parseAIText";
import {
  TextUIPart,
  ReasoningUIPart,
  ToolInvocationUIPart,
  SourceUIPart,
  FileUIPart,
  StepStartUIPart,
  ToolInvocation,
} from "@ai-sdk/ui-utils";
import { Spinner } from "@heroui/react";
import { MessageContent } from "@/types/message";
import { ImageDisplay } from "@/components/ImageDisplay";

type MessagePart =
  | TextUIPart
  | ReasoningUIPart
  | ToolInvocationUIPart
  | SourceUIPart
  | FileUIPart
  | StepStartUIPart;

export const renderMessagePart = (part: MessagePart, index: number) => {
  switch (part.type) {
    case "text":
      return (
        <div key={index} className="whitespace-pre-wrap break-words">
          {parseText(part.text)}
        </div>
      );
    case "tool-invocation":
      return renderToolInvocation(part.toolInvocation, index);
    case "step-start":
    default:
      return null;
  }
};

export const renderMessageWithImages = (message: any, index: number) => {
  const content: MessageContent =
    typeof message.content === "string"
      ? { text: message.content, images: [] }
      : message.content;

  return (
    <div key={index} className="space-y-2">
      {content.images && content.images.length > 0 && (
        <ImageDisplay images={content.images} />
      )}

      {content.text && (
        <div className="whitespace-pre-wrap break-words">
          {parseText(content.text)}
        </div>
      )}
    </div>
  );
};

const renderToolInvocation = (
  toolInvocation: ToolInvocation,
  index: number
) => {
  const toolName = toolInvocation.toolName;
  switch (toolName) {
    case "getCurrentLocation":
      return (
        <p key={index}>
          {toolInvocation.state === "result" &&
            `Great, looks like you are in ${toolInvocation.result}`}
        </p>
      );
    case "getNearbyFoods":
      return <p key={index}>Finding nearby food options...</p>;
    default:
      return <p key={index}>Invoking tool: {toolName}</p>;
  }
};

const renderMessageContent = (content: string, isStreaming: boolean) => {
  try {
    // Try to parse the content as JSON to check if it's structured data
    const parsed = JSON.parse(content);

    // Check if it's our nearby foods data structure
    if (parsed.type === "nearby_foods") {
      return <NearbyFoodsCards data={parsed} location={parsed.locationName} />;
    }
  } catch (e) {
    // If we are streaming and parsing fails, it's probably partial JSON.
    // In that case, we want to show the streaming indicator.
    if (isStreaming) {
      return <Spinner variant="wave" color="warning" />;
    }
  }

  // For regular text content, or for streaming text.
  // If streaming, show content as it arrives, or "streaming..." if empty.
  return <p>{isStreaming ? content || <Spinner variant="wave" /> : content}</p>;
};
