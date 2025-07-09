import { conversationService } from "@/lib/ai/conversation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = searchParams.get("limit") || "10";
    const offset = searchParams.get("offset") || "0";

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const conversations = await conversationService.getUserConversations(
      userId,
      parseInt(limit),
      parseInt(offset)
    );

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error(`Error fetching conversations: ${error}`);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, title } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const conversation = await conversationService.createConversation(
      userId,
      title
    );
    return NextResponse.json({ conversation });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const conversationId = searchParams.get("conversationId");

    if (!userId || !conversationId) {
      return NextResponse.json(
        { error: "userId and conversationId are required" },
        { status: 400 }
      );
    }

    await conversationService.deleteConversation(userId, conversationId);
    return NextResponse.json({
      message: "Conversation deleted successfully",
      success: true,
      status: 200,
    });
  } catch (error) {
    console.error(`Error deleting conversation: ${error}`);
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    );
  }
}
