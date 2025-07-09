import { DocumentProcessor } from "./documentProcessor";
import { EmbeddingsService } from "./embeddings";
import { RestaurantMetadata, VectorStore } from "./vectorStore";

// Type for restaurant documents returned by createRestaurantDocuments
export type RestaurantDocument = Awaited<
  ReturnType<DocumentProcessor["createRestaurantDocuments"]>
>[number];

export type VectorQueryResult = Awaited<
  ReturnType<VectorStore["query"]>
>[number];

export class RAGService {
  private documentProcessor = new DocumentProcessor();
  private embeddingsService = new EmbeddingsService();
  private vectorStore = new VectorStore();

  async indexRestaurants(restaurants: RestaurantMetadata[]) {
    console.log(`Indexing ${restaurants.length} restaurants with chunking...`);

    const allDocuments: RestaurantDocument[] = [];

    // Process restaurants in batches
    const batchSize = 10;
    for (let i = 0; i < restaurants.length; i += batchSize) {
      const batch = restaurants.slice(i, i + batchSize);
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          restaurants.length / batchSize
        )}`
      );

      const batchPromises = batch.map((restaurant) =>
        this.documentProcessor.createRestaurantDocuments(restaurant)
      );

      const batchResults = await Promise.all(batchPromises);
      allDocuments.push(...batchResults.flat());

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(
      `Generated ${allDocuments.length} total chunks from ${restaurants.length} restaurants.`
    );

    // Generate embeddings for all chunks
    const texts = allDocuments.map((doc) => doc.content);
    const embeddings = await this.embeddingsService.generateEmbeddingsBatch(
      texts
    );

    // Prepare vectors for storage
    const vectors = allDocuments.map((doc, index) => ({
      id: doc.id,
      vector: embeddings[index],
      metadata: {
        ...doc.metadata,
        content: doc.content,
        chunkIndex: doc.chunkIndex,
        totalChunks: doc.totalChunks,
      },
    }));

    await this.vectorStore.upsert(vectors);
  }

  async retrieveRelevantRestaurants(query: string, topK = 3) {
    try {
      const queryEmbedding = await this.embeddingsService.generateEmbedding(
        query
      );
      const results = await this.vectorStore.query(queryEmbedding, topK * 2);

      // Group by restaurants and select best chunks
      const restaurantGroups: Map<string, VectorQueryResult[]> = new Map();

      results.forEach((result) => {
        const restaurantId = result.metadata?.fsq_place_id ?? "";
        if (!restaurantGroups.has(restaurantId)) {
          restaurantGroups.set(restaurantId, []);
        }

        const restaurant = restaurantGroups.get(restaurantId);
        if (!restaurant) return;
        restaurant.push(result);
      });

      // Select top restaurant with best chunks
      const topRestaurants = Array.from(restaurantGroups.entries())
        .map(([restaurantId, matches]) => ({
          restaurantId,
          restaurantName: matches[0].metadata?.name,
          chunks: matches.sort((a, b) => b.score - a.score).slice(0, 2), // Top 2 chunks per restaurant
          avgScore:
            matches.reduce((sum, m) => sum + m.score, 0) / matches.length,
        }))
        .sort((a, b) => b.avgScore - a.avgScore)
        .slice(0, topK);

      return topRestaurants.map((restaurant) => ({
        restaurantId: restaurant.restaurantId,
        restaurantName: restaurant.restaurantName,
        content: restaurant.chunks
          .map((chunk) => chunk.metadata?.content)
          .join(" "),
        metadata: restaurant.chunks[0].metadata,
        relevanceScore: restaurant.avgScore,
      }));
    } catch (error) {
      console.error("[RAG] Error retrieving relevant restaurants:", error);
      return [];
    }
  }
}
