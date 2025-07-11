import { title } from "process";
import { redis } from "../redis";
import { MessageContent } from "@/types/message";

export type ConversationMessage = {
  role: "user" | "assistant" | "system";
  content: string | MessageContent;
  timestamp: number;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Array<ConversationMessage>;
  createdAt: number;
  updatedAt: number;
};

export class ConversationService {
  private readonly CONVESRSATION_PREFIX = "conversation:";
  private readonly USER_CONVERSATIONS_PREFIX = "user_conversations:";

  async createConversation(
    userId: string,
    title?: string
  ): Promise<Conversation> {
    const conversationId = this.generateConversationId();
    const timestamp = Date.now();

    const conversation: Conversation = {
      id: conversationId,
      title: title || "New Conversation",
      messages: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await redis.setex(
      `${this.CONVESRSATION_PREFIX}${conversationId}`,
      30 * 24 * 60 * 60,
      JSON.stringify(conversation)
    );

    await redis.zadd(
      `${this.USER_CONVERSATIONS_PREFIX}${userId}`,
      timestamp,
      conversationId
    );

    return conversation;
  }

  async getConversation(conversationId?: string): Promise<Conversation | null> {
    const conversationData = await redis.get(
      `${this.CONVESRSATION_PREFIX}${conversationId}`
    );

    if (!conversationData) {
      throw new Error(`Conversation with ID ${conversationId} not found.`);
    }

    return JSON.parse(conversationData) as Conversation;
  }

  async addMessage(
    conversationId: string,
    message: Omit<ConversationMessage, "timestamp">
  ): Promise<void> {
    const conversation = await this.getConversation(conversationId);

    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found.`);
    }

    const newMessage: ConversationMessage = {
      ...message,
      timestamp: Date.now(),
    };

    conversation.messages.push(newMessage);
    conversation.updatedAt = Date.now();

    if (
      message.role === "user" &&
      conversation.messages.filter((m) => m.role === "user").length === 1
    ) {
      const contentText = typeof message.content === "string" 
        ? message.content 
        : message.content.text;
      conversation.title = `${contentText.slice(0, 50)}${
        contentText.length > 50 ? "..." : ""
      }`;
    }

    await redis.setex(
      `${this.CONVESRSATION_PREFIX}${conversationId}`,
      30 * 24 * 60 * 60,
      JSON.stringify(conversation)
    );
  }

  async getUserConversations(
    userId: string,
    limit = 10,
    offset = 0
  ): Promise<Conversation[]> {
    const conversationIds = await redis.zrevrange(
      `${this.USER_CONVERSATIONS_PREFIX}${userId}`,
      offset,
      offset + limit - 1
    );

    const conversations: Conversation[] = [];

    for (const conversationId of conversationIds) {
      const conversation = await this.getConversation(conversationId);
      if (conversation) {
        conversations.push(conversation);
      }
    }

    return conversations;
  }

  async deleteConversation(
    userId: string,
    conversationId: string
  ): Promise<void> {
    await redis.zrem(
      `${this.USER_CONVERSATIONS_PREFIX}${userId}`,
      conversationId
    );
    await redis.del(`${this.CONVESRSATION_PREFIX}${conversationId}`);
  }

  async getConversationContext(
    conversationId: string,
    maxMessages = 10
  ): Promise<ConversationMessage[]> {
    const conversation = await this.getConversation(conversationId);

    if (!conversation) {
      return [];
    }

    return conversation.messages
      .filter((message) => message.role !== "system")
      .slice(-maxMessages);
  }

  private generateConversationId(): string {
    return `conversation_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 15)}`;
  }
}

export const conversationService = new ConversationService();
