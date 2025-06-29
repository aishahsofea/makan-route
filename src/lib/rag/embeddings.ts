import { openai } from "@ai-sdk/openai";
import { embed, embedMany, EmbeddingModel } from "ai";

export class EmbeddingsService {
  async generateEmbedding(text: string): Promise<number[]> {
    const { embedding } = await embed({
      model: openai.embedding("text-embedding-3-small"),
      value: text,
    });

    return embedding;
  }

  async generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    const { embeddings } = await embedMany({
      model: openai.embedding("text-embedding-3-small"),
      values: texts,
    });

    return embeddings;
  }
}
