import { z } from "zod";
import { RestaurantSchema } from "./schema";
import { ChromaClient, Collection } from "chromadb";

export type RestaurantMetadata = z.infer<typeof RestaurantSchema>;

export type RestaurantVectorMetadata = RestaurantMetadata & {
  content: string;
  chunkIndex: number;
  totalChunks: number;
};

type Vectors = Array<{
  id: string;
  vector: number[];
  metadata: RestaurantVectorMetadata;
}>;

export class VectorStore {
  private client: ChromaClient;
  private collection!: Collection;
  private collectionName = "restaurants";

  constructor() {
    this.client = new ChromaClient({ path: "http://localhost:8000" });
  }

  checkHeartbeat() {
    this.client.heartbeat();
  }

  private async getOrCreateCollection(): Promise<Collection> {
    try {
      this.collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
      });
      console.log(`Using existing collection: ${this.collectionName}`);
    } catch (error) {
      this.collection = await this.client.createCollection({
        name: this.collectionName,
        metadata: {
          description: "Restaurant embeddings for RAG system",
        },
      });
      console.log(`✅ Created new collection: ${this.collectionName}`);
    }

    return this.collection;
  }

  async upsert(vectors: Vectors) {
    try {
      const collection = await this.getOrCreateCollection();
      const ids = vectors.map((v) => v.id);
      const embeddings = vectors.map((v) => v.vector);
      const metadatas = vectors.map((v) => ({
        ...v.metadata,
        categories: v.metadata.categories.join(", "), // Convert array to string
        tastes: v.metadata.tastes?.join(", ") || "", // Convert array to string
        attributes: JSON.stringify(v.metadata.attributes || {}), // Convert object to string
      }));

      await collection.upsert({
        ids,
        embeddings,
        metadatas,
      });

      console.log(`✅ Upserted ${vectors.length} vectors to ChromaDB`);
    } catch (error) {
      console.error(`Error upserting vectors: ${error}`);
      throw error;
    }
  }

  async query(vector: number[], topK: number = 5) {
    try {
      const collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
      });
      const results = await collection.query({
        queryEmbeddings: [vector],
        nResults: topK,
        include: ["metadatas", "distances"],
      });

      const transformedResults = results.ids[0].map((id, index) => ({
        id,
        score: 1 - (results.distances[0][index] || 0), // Convert distance to score
        metadata: results.metadatas[0][
          index
        ] as unknown as RestaurantVectorMetadata,
      }));

      return transformedResults;
    } catch (error) {
      console.error(`Error querying vectors: ${error}`);
      throw error;
    }
  }

  async delete(ids: string[]) {
    try {
      const collection = await this.getOrCreateCollection();
      await collection.delete({ ids });
      console.log(`✅ Deleted ${ids.length} vectors from ChromaDB`);
    } catch (error) {
      console.error("Error deleting vectors:", error);
      throw error;
    }
  }
}
