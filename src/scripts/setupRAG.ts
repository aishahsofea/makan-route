import { TopRestaurantsCollector } from "@/lib/data/topRestaurantsCollector";
import { RAGService } from "@/lib/rag/retrieval";

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
};

const testRAGSystem = async (ragService: RAGService) => {
  const testQueries = [
    "What are the best restaurants in KL?",
    "Recommend a restaurant for dinner",
    "What are the top-rated restaurants?",
    "Find me a good tapas restaurant",
  ];

  for (const query of testQueries) {
    console.log(`\nQuery: "${query}"`);
    const results = await ragService.retrieveRelevantRestaurants(query, 3);
    console.log(`Found ${results.length} results`);
    results.forEach((result, index) => {
      console.log(
        `   ${index + 1}. ${
          result.restaurantName
        } (Score: ${result.relevanceScore.toFixed(3)})`
      );
      console.log(`     Content: ${result.content.substring(0, 100)}...`);
    });
  }
};

setupRAG().catch(console.error);
