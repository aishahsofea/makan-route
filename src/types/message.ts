export type ImageAttachment = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  width?: number;
  height?: number;
};

export type MessageContent = {
  text: string;
  images?: ImageAttachment[];
};

export type ConversationMessage = {
  role: "user" | "assistant" | "system";
  content: MessageContent;
  timestamp: number;
};
