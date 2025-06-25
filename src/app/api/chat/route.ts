import { getNearbyFoods } from "@/lib/ai/tools/getNearbyFoods";
import { getRoute } from "@/lib/ai/tools/getRoute";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    console.log("Chat API called with messages:", messages);

    // Validate that messages array is not empty
    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array cannot be empty" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    try {
      const result = streamText({
        model: openai("gpt-4o-mini"),
        messages: [
          {
            role: "system",
            content: `You are a helpful assistant for finding nearby food places. Add additional context to the result, but do not return the result because i am going to display the results returned from the tool invocation.`,
          },
          ...messages,
        ],
        tools: {
          // getRoute,
          getCurrentLocation: {
            description:
              "Get the user's current location. Always ask for confirmation before using this tool.",
            parameters: z.object({}),
          },
          getNearbyFoods,
        },
      });

      return result.toDataStreamResponse();
    } catch (streamError) {
      console.error("Error in streamText:", streamError);
      throw streamError;
    }
  } catch (error) {
    console.error("Error in chat API:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET(request: Request) {}
