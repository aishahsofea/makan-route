# RAG Implementation for Makan-Route

## Quick Start Implementation

### 1. Install Required Dependencies

```bash
# Core AI SDK (you already have this)
yarn add @ai-sdk/openai

# Vector database (recommended: Upstash Vector for Redis compatibility)
yarn add @upstash/vector

# Text processing utilities
yarn add langchain @langchain/openai
```

### 2. Environment Variables

Add to your `.env`:
```env
# Vector Database
UPSTASH_VECTOR_REST_URL=your_upstash_vector_url
UPSTASH_VECTOR_REST_TOKEN=your_upstash_vector_token

# OpenAI (for embeddings)
OPENAI_API_KEY=your_openai_api_key
```

### 3. Basic RAG Implementation

#### Step 1: Create Vector Store Service

```typescript
// src/lib/rag/vectorStore.ts
import { createClient } from '@upstash/vector'

const client = createClient({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
})

export class VectorStore {
  private client = client
  private indexName = 'restaurants'

  async upsert(vectors: Array<{ id: string; vector: number[]; metadata: any }>) {
    return this.client.upsert({
      indexName: this.indexName,
      vectors,
    })
  }

  async query(vector: number[], topK: number = 5) {
    return this.client.query({
      indexName: this.indexName,
      vector,
      topK,
      includeMetadata: true,
    })
  }
}
```

#### Step 2: Create Embeddings Service

```typescript
// src/lib/rag/embeddings.ts
import { openai } from '@ai-sdk/openai'

export class EmbeddingsService {
  async generateEmbedding(text: string): Promise<number[]> {
    const embedding = await openai.embed({
      model: 'text-embedding-3-small',
      value: text,
    })
    return embedding.embedding
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings = await openai.embed({
      model: 'text-embedding-3-small',
      value: texts,
    })
    return embeddings.embedding
  }
}
```

#### Step 3: Create Document Processing

```typescript
// src/lib/rag/documentProcessor.ts
export interface RestaurantDocument {
  id: string
  name: string
  description: string
  cuisine: string
  address: string
  rating?: number
  price?: string
  categories: string[]
}

export class DocumentProcessor {
  createRestaurantDocument(place: any): RestaurantDocument {
    return {
      id: place.fsq_id,
      name: place.name,
      description: this.generateDescription(place),
      cuisine: place.categories?.[0]?.name || 'Restaurant',
      address: place.location?.formatted_address || '',
      rating: place.rating,
      price: place.price,
      categories: place.categories?.map((cat: any) => cat.name) || [],
    }
  }

  private generateDescription(place: any): string {
    const parts = [
      place.name,
      place.categories?.[0]?.name,
      place.location?.formatted_address,
      place.rating ? `${place.rating}/10 rating` : '',
      place.price ? `Price: ${place.price}` : '',
    ].filter(Boolean)
    
    return parts.join(' - ')
  }

  chunkDocument(doc: RestaurantDocument): string[] {
    // Simple chunking strategy - you can make this more sophisticated
    const chunks = []
    
    // Main description chunk
    chunks.push(doc.description)
    
    // Categories chunk
    if (doc.categories.length > 0) {
      chunks.push(`Categories: ${doc.categories.join(', ')}`)
    }
    
    return chunks
  }
}
```

#### Step 4: Create RAG Retrieval Service

```typescript
// src/lib/rag/retrieval.ts
import { VectorStore } from './vectorStore'
import { EmbeddingsService } from './embeddings'
import { DocumentProcessor, RestaurantDocument } from './documentProcessor'

export class RAGService {
  private vectorStore = new VectorStore()
  private embeddingsService = new EmbeddingsService()
  private documentProcessor = new DocumentProcessor()

  async indexRestaurants(places: any[]) {
    const documents = places.map(place => 
      this.documentProcessor.createRestaurantDocument(place)
    )

    const vectors = []
    
    for (const doc of documents) {
      const chunks = this.documentProcessor.chunkDocument(doc)
      
      for (let i = 0; i < chunks.length; i++) {
        const embedding = await this.embeddingsService.generateEmbedding(chunks[i])
        vectors.push({
          id: `${doc.id}_chunk_${i}`,
          vector: embedding,
          metadata: {
            restaurantId: doc.id,
            restaurantName: doc.name,
            chunkIndex: i,
            content: chunks[i],
            cuisine: doc.cuisine,
            address: doc.address,
          }
        })
      }
    }

    await this.vectorStore.upsert(vectors)
  }

  async retrieveRelevantRestaurants(query: string, topK: number = 5) {
    const queryEmbedding = await this.embeddingsService.generateEmbedding(query)
    const results = await this.vectorStore.query(queryEmbedding, topK)
    
    return results.matches?.map(match => match.metadata) || []
  }
}
```

#### Step 5: Integrate with Chat API

```typescript
// src/app/api/chat/route.ts (modified)
import { RAGService } from '@/lib/rag/retrieval'

const ragService = new RAGService()

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()
    const lastMessage = messages[messages.length - 1]

    // Retrieve relevant context using RAG
    const relevantContext = await ragService.retrieveRelevantRestaurants(
      lastMessage.content,
      3
    )

    // Create enhanced system prompt with context
    const contextPrompt = relevantContext.length > 0 
      ? `\n\nRelevant restaurant information:\n${relevantContext
          .map(ctx => `- ${ctx.restaurantName}: ${ctx.content}`)
          .join('\n')}`
      : ''

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant for finding nearby food places. 
          Use the provided restaurant information to give more accurate and detailed recommendations.
          ${contextPrompt}`,
        },
        ...messages,
      ],
      tools: {
        getCurrentLocation: {
          description: "Get the user's current location. Always ask for confirmation before using this tool.",
          parameters: z.object({}),
        },
        getNearbyFoods,
        getRoute,
        getFoodsAlongTheRoute,
      },
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
```

### 4. Data Ingestion Process

```typescript
// src/lib/rag/dataIngestion.ts
import { RAGService } from './retrieval'

export async function ingestRestaurantData() {
  const ragService = new RAGService()
  
  // Fetch restaurants from your existing API
  const response = await fetch('/api/makan-spots?ne=...&sw=...')
  const places = await response.json()
  
  // Index them in the vector database
  await ragService.indexRestaurants(places)
  
  console.log(`Indexed ${places.length} restaurants`)
}
```

### 5. Testing the RAG System

```typescript
// src/lib/rag/test.ts
import { RAGService } from './retrieval'

export async function testRAG() {
  const ragService = new RAGService()
  
  const queries = [
    "I want Italian food",
    "Show me cheap restaurants",
    "Where can I find vegetarian options?",
    "Best rated restaurants near me",
  ]
  
  for (const query of queries) {
    console.log(`\nQuery: ${query}`)
    const results = await ragService.retrieveRelevantRestaurants(query)
    console.log('Results:', results.map(r => r.restaurantName))
  }
}
```

## Next Steps

1. **Implement the basic RAG system** using the code above
2. **Test with your existing restaurant data**
3. **Add more sophisticated chunking strategies**
4. **Implement hybrid search (vector + keyword)**
5. **Add result reranking**
6. **Optimize for performance**

## Key AI Concepts You'll Learn

- **Embeddings**: Converting text to numerical vectors
- **Vector Similarity**: Finding similar content mathematically
- **Semantic Search**: Understanding meaning, not just keywords
- **Context Injection**: Enhancing AI responses with relevant information
- **Chunking Strategies**: Breaking down documents for better retrieval
- **Retrieval-Augmented Generation**: Combining search with AI generation

This implementation will significantly improve your chatbot's ability to provide relevant restaurant recommendations based on user queries! 