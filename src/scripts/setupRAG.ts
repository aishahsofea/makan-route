import { config } from "dotenv";
import { TopRestaurantsCollector } from "@/lib/data/topRestaurantsCollector";
import { RAGService } from "@/lib/rag/retrieval";
import { testRAGSystem } from "./testRAGSystem";

config();

const setupRAG = async () => {
  console.log("🚀 Setting up RAG system with chunking...");

  // 1. Collect top restaurants
  const dataCollector = new TopRestaurantsCollector();
  const topRestaurants = await dataCollector.getTopRestaurantsInKL();
  console.log(`✅ Collected ${topRestaurants.length} top restaurants`);

  // 2. Index in RAG system with chunking
  const ragService = new RAGService();
  await ragService.indexRestaurants(topRestaurants);

  // 3. Test the RAG system
  await testRAGSystem(ragService);

  // 4. Exit the process
  console.log("✅ RAG system setup and testing complete. Exiting...");
  process.exit(0);
};

setupRAG().catch(console.error);
