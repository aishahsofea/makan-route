import { getFoodsAlongTheRoute } from "@/lib/ai/tools/getFoodsAlongTheRoute";
import { getNearbyFoods } from "@/lib/ai/tools/getNearbyFoods";
import { getRoute } from "@/lib/ai/tools/getRoute";
import { RAGService } from "@/lib/ai/rag/retrieval";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";
import { conversationService } from "@/lib/ai/conversation";

const ragService = new RAGService();

export async function POST(request: Request) {
  try {
    const { messages, conversationId, userId } = await request.json();
    const lastMessage = messages.at(-1);

    console.log(
      `Chat API called with messages: ${JSON.stringify(
        messages
      )}. Conversation ID: ${conversationId}`
    );

    // Get conversation history for context
    let conversationHistory: any[] = [];
    if (conversationId) {
      try {
        const history = await conversationService.getConversationContext(
          conversationId,
          10
        );
        conversationHistory = history.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));
        console.log(
          `Retrieved ${conversationHistory.length} messages from conversation history`
        );
      } catch (error) {
        console.log(`Failed to retrieve conversation history: ${error}`);
      }
    }

    // Retrieve relevant resturant context using RAG
    let relevantContext = "";
    try {
      const relevantRestaurants = await ragService.retrieveRelevantRestaurants(
        lastMessage.content,
        3
      );

      if (relevantRestaurants.length > 0) {
        relevantContext = `
        
        Relevant restaurant information:
        
        ${relevantRestaurants
          .map(
            (restaurant, index) =>
              `${index + 1}. **${
                restaurant.restaurantName
              }** (Score: ${restaurant.relevanceScore.toFixed(3)})
            
              ${restaurant.content}.
            `
          )
          .join("\n\n")}
        `;

        console.log(
          `RAG found ${relevantRestaurants.length} relevant restaurants.`
        );
      }
    } catch (error) {
      console.log(
        `RAG retrieval failed. Continuing without context. Error: ${error}`
      );
    }

    // Create enhanced prompt with RAG context
    const enhancedSystemPrompt = `You are a helpful assistant for finding places to eat, specifically in Kuala Lumpur, Malaysia. You help users find restaurants either based on their locations or their driving routes.
    
    ${relevantContext}
    
    Always be helpful, friendly, and provide specific, actionable recommendations.

    ${
      conversationHistory.length > 0
        ? `Previous conversation context: ${conversationHistory
            .map((msg) => `${msg.role}: ${msg.content}`)
            .join("\n")}`
        : ""
    }
  `;

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
            content: enhancedSystemPrompt,
          },
          ...messages,
        ],
        tools: {
          getCurrentLocation: {
            description:
              "Get the user's current location. Always ask for confirmation before using this tool. Do not use this tool if they have already provided a starting point and destination.",
            parameters: z.object({}),
          },
          getNearbyFoods,
          getRoute,
          getFoodsAlongTheRoute,
        },
        onFinish: async (completion) => {
          if (!conversationId || !userId) {
            console.error("Conversation ID or User ID is missing.");
            return;
          }

          try {
            // Store user message
            await conversationService.addMessage(conversationId, {
              role: "user",
              content: lastMessage.content,
            });

            // Store assistant response
            await conversationService.addMessage(conversationId, {
              role: "assistant",
              content: completion.text,
            });
          } catch (error) {
            console.error(`Failed to store conversation messages: ${error}`);
          }
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
