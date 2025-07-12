import { analyzeFoodImage, FoodAnalysisResult } from "@/utils/vision";
import { ImageAttachment } from "@/types/message";
import { RAGService } from "./retrieval";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export type VisionRAGResult = {
  visionAnalysis: FoodAnalysisResult;
  ragContext: string;
  response: string;
};

export type SearchResult = {
  content: string;
  score: number;
  id: string;
};

const ragService = new RAGService();

export const searchSimilarContent = async (
  query: string
): Promise<SearchResult[]> => {
  try {
    // Use existing RAG service to retrieve relevant restaurants
    const results = await ragService.retrieveRelevantRestaurants(query, 5);

    // Convert to the expected format
    return results.map((result) => ({
      content: result.content,
      score: result.relevanceScore,
      id: result.restaurantId,
    }));
  } catch (error) {
    console.error("Error retrieving similar content:", error);
    return [];
  }
};

export const processVisionWithRAG = async (
  images: ImageAttachment[],
  userMessage: string
): Promise<VisionRAGResult> => {
  // Analyze the images using the vision API
  const visionAnalysis = await analyzeFoodImage(images, userMessage);

  // Create search query from the vision analysis
  const searchQuery = createSearchQuery(visionAnalysis, userMessage);

  // Retrieve relevant context using RAG
  const ragResults = await searchSimilarContent(searchQuery);
  const ragContext = ragResults.map((result) => result.content).join("\n\n");

  // Generate response using combined context
  const { text: response } = await generateText({
    model: openai("gpt-4o-mini"),
    prompt: createCombinedPrompt(visionAnalysis, ragContext, userMessage),
  });

  return { visionAnalysis, ragContext, response };
};

const createSearchQuery = (
  analysis: FoodAnalysisResult,
  userMessage: string
): string => {
  const queryParts = [...analysis.foodItems, analysis.cuisine, userMessage];

  return queryParts.join(" ").trim();
};

const createCombinedPrompt = (
  analysis: FoodAnalysisResult,
  ragContext: string,
  userMessage: string
): string => {
  return `You are a Malaysian food expert assistant. Based on the food analysis and relevant context, provide a detailed response to the user's query.
  
  VISION ANALYSIS:
  - Food items: ${analysis.foodItems.join(", ")}
  - Cuisine: ${analysis.cuisine}
  - Description: ${analysis.description}
  - AI recommendations: ${analysis.recommendations.join(", ")}
  - Confidence: ${analysis.confidence}

  RELEVANT CONTEXT:
  ${ragContext}

  USER QUERY: ${userMessage}

  Please provide a comprehensive answer that:
  1. Acknowledges the food items identified
  2. Uses the relevant context to provide accurate information
  3. Offers personalized recommendations
  4. Includes cultural context where applicable
  5. Suggests where the user can find similar dishes or alternatives

  Focus on being helpful, informative, and culturally relevant. Use the analysis and context to enrich your response. Avoid generic answers and ensure the response is tailored to the user's query.
  `;
};
