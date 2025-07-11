import { ImageAttachment } from "@/types/message";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import path from "path";
import fs from "fs";
import { z } from "zod";

type Content = {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
    detail?: "low" | "high" | "auto";
  };
};

export type VisionMessage = {
  role: "user" | "assistant";
  content: Content[];
};

export type FoodAnalysisResult = {
  foodItems: string[];
  cuisine: string;
  description: string;
  recommendations: string[];
  confidence: number;
};

const FoodAnalysisSchema = z.object({
  foodItems: z.array(z.string()),
  cuisine: z.string(),
  description: z.string(),
  recommendations: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

const FOOD_ANALYSIS_PROMPT = `You are a food analysis expert. Analyze the food in the provided images and provide structure information.

  Guidelines:
  - foodItems: List all identifiable food items
  - cuisine: Identify the cuisine type (e.g., Italian, Chinese, etc.)
  - description: Provide a brief description of the food, and where they can get it from (e.g., they can get a Palak paneer from an Indian restaurant)
  - recommendations: Suggest similar dishes or alternatives
  - confidence: Provide a confidence score between 0 and 1 in the food identification

  Focus on:
  - Traditional Malaysian/South East Asian dishes
  - Street food identification
  - Ingredient recognition
  - Cultural context of the food
`;

export const convertToVisionMessage = (
  text: string,
  images: ImageAttachment[]
): VisionMessage => {
  const content: VisionMessage["content"] = [{ type: "text", text }];

  images.forEach((image) => {
    content.push({
      type: "image_url",
      image_url: {
        url: `${process.env.NEXT_PUBLIC_BASE_URL}${image.url}`,
        detail: "high",
      },
    });
  });

  return { role: "user", content };
};

export const analyzeFoodImage = async (
  images: ImageAttachment[],
  userMessage: string = "What food do you see in this image?"
): Promise<FoodAnalysisResult> => {
  console.log(`🔍 Starting vision analysis with ${images.length} images`);

  try {
    // Convert images to base64 data URLs
    const imageContent = await Promise.all(
      images.map(async (image) => {
        const imagePath = path.join(process.cwd(), "public", image.url);
        const imageBuffer = fs.readFileSync(imagePath);
        const base64String = imageBuffer.toString("base64");

        const dataUrl = `data:${image.mimeType};base64,${base64String}`;

        console.log(
          `✅ Converted ${image.filename} to base64 (${Math.round(
            dataUrl.length / 1024
          )}KB)`
        );

        return {
          type: "image" as const,
          image: dataUrl,
        };
      })
    );

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: FoodAnalysisSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${FOOD_ANALYSIS_PROMPT}\n\nUser query: ${userMessage}`,
            },
            ...imageContent,
          ],
        },
      ],
    });

    console.log("✅ Vision analysis successful:", object);
    return object;
  } catch (error) {
    console.error("❌ Error analyzing food images:", error);

    // Fallback response
    return {
      foodItems: ["Unknown food item"],
      cuisine: "Unknown",
      description: "Could not analyze the food in the image.",
      recommendations: ["Try describing the food in text."],
      confidence: 0.0,
    };
  }
};
