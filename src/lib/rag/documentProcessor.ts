import { openai } from "@ai-sdk/openai";
import { RestaurantMetadata } from "./vectorStore";
import { generateText } from "ai";
import { ChunkingStrategy } from "./chunkingStrategy";
import { z } from "zod";
import { RestaurantSchema } from "./schema";

type Restaurant = z.infer<typeof RestaurantSchema>;

export class DocumentProcessor {
  private chunkingStrategy = new ChunkingStrategy();

  async createRestaurantDocuments(restaurant: Restaurant) {
    const comprehensiveDescription =
      await this.generateComprehensiveDescription(restaurant);

    const chunks = this.chunkingStrategy.chunkSemantically(
      comprehensiveDescription
    );

    const documents = chunks.map((chunk, index) => ({
      id: `${restaurant.fsq_place_id}_chunk_${index}`,
      content: chunk,
      chunkIndex: index,
      totalChunks: chunks.length,
      metadata: {
        fsq_place_id: restaurant.fsq_place_id,
        name: restaurant.name,
        categories: restaurant.categories,
        location: restaurant.location,
        description: restaurant.description,
        price: restaurant.price,
        rating: restaurant.rating,
        popularity: restaurant.popularity,
        tastes: restaurant.tastes,
        attributes: restaurant.attributes,
      },
    }));

    console.log(
      `Created ${documents.length} chunks for restaurant: ${restaurant.name}`
    );

    return documents;
  }

  private async generateComprehensiveDescription(restaurant: Restaurant) {
    const prompt = `Create a comprehensive description of this restaurant for a food recommendation system.
    
    Restaurant data:
    - Name: ${restaurant.name}
    - Category: ${restaurant.categories.join(", ") || "No categories available"}
    - Address: ${restaurant.location || "Address not available"}
    - Description: ${restaurant.description || "No description available"}
    - Price: ${restaurant.price || "Price not specified"}
    - Rating: ${restaurant.rating || "No rating"}
    - Popularity: ${restaurant.popularity || "No popularity score"}
    - Tastes: ${restaurant.tastes.join(", ") || "No tastes available"}
    - Attributes: ${Object.entries(restaurant.attributes)}
    
    Write a detailed 4-6 sentence description that covers:
    1. What type of restaurant it is and what they serve
    2. Their specialties and what they're known for
    3. Location and accessibility
    4. Rating, pricing, and atmosphere
    5. Any unique features or highlights
    
    Make it natural and comprehensive for food recommendations.
    
    Description:`;

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
    });

    return text;
  }
}
