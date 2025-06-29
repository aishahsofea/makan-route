import { Index } from "@upstash/vector";
import { z } from "zod";
import { RestaurantSchema } from "./schema";

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

const index = new Index<RestaurantMetadata>({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

export class VectorStore {
  async upsert(vectors: Vectors) {
    try {
      await index.upsert(vectors);
    } catch (error) {
      console.error("Error upserting vectors:", error);
      throw error;
    }
  }

  async query(vector: number[], topK: number = 5) {
    try {
      const results = await index.query({
        vector,
        topK,
        includeMetadata: true,
      });
      return results;
    } catch (error) {
      console.error("Error querying vectors:", error);
      throw error;
    }
  }

  async delete(ids: string[]) {
    try {
      await index.delete(ids);
      console.log(`✅ Deleted ${ids.length} vectors from index`);
    } catch (error) {
      console.error("Error deleting vectors:", error);
      throw error;
    }
  }
}
