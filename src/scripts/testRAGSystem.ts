import { RAGService } from "@/lib/ai/rag/retrieval";

export const testRAGSystem = async (ragService: RAGService) => {
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
