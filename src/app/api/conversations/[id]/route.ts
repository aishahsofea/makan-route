import { conversationService } from "@/lib/ai/conversation";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";

type Params = { id: string };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  const { id: conversationId } = await params;

  try {
    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    const conversation = await conversationService.getConversation(
      conversationId as string
    );

    if (!conversation) {
      return NextResponse.json({
        error: `Conversation with ID ${conversationId} not found.`,
        status: 404,
      });
    }

    return NextResponse.json({ conversation, status: 200 });
  } catch (error) {
    console.error(
      `Error fetching conversation with ID ${conversationId}:`,
      error
    );
    return NextResponse.json(
      { error: `Failed to fetch conversation: ${error}` },
      { status: 500 }
    );
  }
}
