import { getFoodsAlongTheRoute } from "@/lib/ai/tools/getFoodsAlongTheRoute";
import { getNearbyFoods } from "@/lib/ai/tools/getNearbyFoods";
import { getRoute } from "@/lib/ai/tools/getRoute";
import { RAGService } from "@/lib/ai/rag/retrieval";
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";
import { conversationService } from "@/lib/ai/conversation";
import { MessageContent } from "@/types/message";
import {
  processVisionWithRAG,
  VisionRAGResult,
} from "@/lib/ai/rag/visionIntegration";

const ragService = new RAGService();

export async function POST(request: Request) {
  try {
    const { messages, conversationId, userId } = await request.json();

    console.log(`📨 Received messages: ${JSON.stringify(messages, null, 2)}`);

    const lastMessage = messages.at(-1);
    const hasImages =
      lastMessage?.content?.images && lastMessage.content.images.length > 0;

    console.log(`🖼️ Has images: ${hasImages}`);
    console.log(`📩 Last message: ${lastMessage.content}`);

    let processedMessages = messages;
    let relevantContext = "";

    const processTextOnly = (msg: any) => {
      if (typeof msg.content === "string") {
        return {
          ...msg,
          content: msg.content,
        };
      } else {
        const content = msg.content as MessageContent;
        let text = content.text;

        if (content.images && content.images.length > 0) {
          text += `\n[User uploaded ${content.images.length} image(s) - vision analysis unavailable]`;
        }

        return {
          ...msg,
          content: text,
        };
      }
    };

    const createVisionContext = (vision: VisionRAGResult) => {
      const { visionAnalysis, ragContext } = vision;
      return `
        VISION ANALYSIS:
        - Food items: ${visionAnalysis.foodItems.join(", ")}
        - Cuisine: ${visionAnalysis.cuisine}
        - Description: ${visionAnalysis.description}
        - AI recommendations: ${visionAnalysis.recommendations.join(", ")}

        RELEVANT RESTAURANTS:
        ${ragContext}
      `;
    };

    const createRelevantRestaurantContext = (
      restaurants: Awaited<
        ReturnType<RAGService["retrieveRelevantRestaurants"]>
      >
    ) => {
      return `Relevant restaurant information:
      ${restaurants
        .map(
          (restaurant, index) => `
        ${index + 1}. **${
            restaurant.restaurantName
          }** (Score: ${restaurant.relevanceScore.toFixed(3)})
        ${restaurant.content}
      `
        )
        .join("\n\n")}`;
    };

    if (hasImages) {
      try {
        // Process images with vision API and RAG
        console.log(
          `Processing ${lastMessage.content.images.length} images with vision API`
        );
        const visionResult = await processVisionWithRAG(
          lastMessage.content.images,
          lastMessage.content.text
        );

        relevantContext = createVisionContext(visionResult);

        processedMessages = messages.map((msg: any) => {
          if (msg === lastMessage) {
            return {
              ...msg,
              content: `${
                msg.content.text
              }\n\n[Vision analysis: I can see ${visionResult.visionAnalysis.foodItems.join(
                ", "
              )} in the image(s) you provided]`,
            };
          }

          return {
            ...msg,
            content:
              typeof msg.content === "string" ? msg.content : msg.content.text,
          };
        });

        console.log(
          `Vision processing completed. Found ${visionResult.visionAnalysis.foodItems.join(
            ", "
          )}`
        );
      } catch (error) {
        console.error("Error processing images: ", error);

        // Fallback to text-only processing
        processedMessages = messages.map((msg: any) => processTextOnly(msg));

        // Try regular RAG without vision
        try {
          const relevantRestaurants =
            await ragService.retrieveRelevantRestaurants(
              lastMessage.content.text,
              3
            );

          if (relevantRestaurants.length > 0) {
            relevantContext =
              createRelevantRestaurantContext(relevantRestaurants);
          }
        } catch (error) {
          console.error("❌ RAG retrieval also failed:: ", error);
        }
      }
    } else {
      // Process text messages only
      processedMessages = messages.map((msg: any) => ({
        ...msg,
        content:
          typeof msg.content === "string" ? msg.content : msg.content.text,
      }));

      // Try regular RAG retrieval
      try {
        const relevantRestaurants =
          await ragService.retrieveRelevantRestaurants(
            lastMessage.content.text,
            3
          );

        if (relevantRestaurants.length > 0) {
          relevantContext =
            createRelevantRestaurantContext(relevantRestaurants);
        }
      } catch (error) {
        console.error("❌ RAG retrieval failed: ", error);
      }
    }

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
      } catch (error) {
        console.log(`❌ Failed to retrieve conversation history: ${error}`);
      }
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
          ...processedMessages,
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
        maxSteps: 5,
        onFinish: async (completion) => {
          if (!conversationId || !userId) {
            console.error("Conversation ID or User ID is missing.");
            return;
          }

          try {
            // Store user message with original content structure
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
            console.error(`❌ Failed to store conversation messages: ${error}`);
          }
        },
      });

      return result.toDataStreamResponse();
    } catch (streamError) {
      console.error("❌ Error in streamText:", streamError);
      throw streamError;
    }
  } catch (error) {
    console.error("❌ Error in chat API:", error);
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
