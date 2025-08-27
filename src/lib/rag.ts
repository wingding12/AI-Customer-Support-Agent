import { avenKnowledgeBase } from "@/data/aven-knowledge";
import { createEmbedding, generateResponse } from "@/lib/embeddings";
import {
  queryVectors,
  upsertVectors,
  createIndex,
  VectorMetadata,
} from "@/lib/pinecone";
import { Logger } from "@/utils/logger";

const logger = new Logger("RAG");

// Initialize the knowledge base in Pinecone
export async function initializeKnowledgeBase() {
  try {
    logger.info("Initializing Aven knowledge base in Pinecone");

    // Create index if it doesn't exist
    await createIndex("aven-knowledge-base");

    // Prepare vectors
    const vectors: {
      id: string;
      values: number[];
      metadata: VectorMetadata;
    }[] = [];

    for (const item of avenKnowledgeBase) {
      const embedding = await createEmbedding(item.content);
      if (embedding) {
        vectors.push({
          id: item.id,
          values: embedding,
          metadata: {
            id: item.id,
            text: item.content,
            category: item.category || "general",
            topic: item.topic || "general",
          },
        });
      }
    }

    if (vectors.length > 0) {
      // Upsert vectors in batches to avoid rate limits
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await upsertVectors(batch);
        logger.info(
          `Uploaded batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(vectors.length / batchSize)}`
        );
      }

      logger.info(
        `Successfully initialized knowledge base with ${vectors.length} vectors`
      );
    } else {
      logger.warn("No vectors to upload - check OpenAI configuration");
    }

    return vectors.length;
  } catch (error) {
    logger.error("Failed to initialize knowledge base", { error });
    throw error;
  }
}

// Search for relevant context using vector similarity
export async function searchContext(
  query: string,
  topK: number = 5
): Promise<string[]> {
  try {
    // Create embedding for the query
    const queryEmbedding = await createEmbedding(query);
    if (!queryEmbedding) {
      logger.warn(
        "Could not create query embedding, falling back to text search"
      );
      // Fallback to simple text search
      const results = avenKnowledgeBase
        .filter(
          item =>
            item.content.toLowerCase().includes(query.toLowerCase()) ||
            item.topic.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, topK)
        .map(item => item.content);
      return results;
    }

    // Query Pinecone for similar vectors
    const searchResults = await queryVectors(queryEmbedding, topK);

    if (!searchResults.matches || searchResults.matches.length === 0) {
      logger.warn("No matches found in vector search");
      return [];
    }

    // Extract and return the text content
    const contexts = searchResults.matches
      .filter(match => match.metadata && match.score && match.score > 0.7)
      .map(match => (match.metadata as VectorMetadata).text);

    logger.info(`Found ${contexts.length} relevant contexts for query`);
    return contexts;
  } catch (error) {
    logger.error("Failed to search context", { error });
    // Fallback to local search
    return avenKnowledgeBase
      .filter(
        item =>
          item.content.toLowerCase().includes(query.toLowerCase()) ||
          item.topic.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, topK)
      .map(item => item.content);
  }
}

// Generate a response using RAG
export async function generateRAGResponse(
  userQuery: string,
  conversationHistory?: { role: string; content: string }[]
): Promise<{ response: string; contexts: string[] }> {
  try {
    logger.info("Generating RAG response for user query");

    // Search for relevant context
    const contexts = await searchContext(userQuery, 5);

    // Combine contexts into a single string
    const contextString =
      contexts.length > 0
        ? contexts.join("\n\n")
        : "No specific information found in knowledge base.";

    // Build conversation context
    let conversationContext = "";
    if (conversationHistory && conversationHistory.length > 0) {
      conversationContext =
        "\n\nPrevious conversation:\n" +
        conversationHistory
          .slice(-4)
          .map(msg => `${msg.role}: ${msg.content}`)
          .join("\n");
    }

    // Create the full prompt
    const fullPrompt = `User Question: ${userQuery}${conversationContext}`;

    // Generate response
    const response =
      (await generateResponse(fullPrompt, contextString)) ||
      "I apologize, but I'm having trouble generating a response right now. Please try again or contact Aven support at 1-800-AVEN-HLP for immediate assistance.";

    logger.info("Successfully generated RAG response");
    return {
      response,
      contexts,
    };
  } catch (error) {
    logger.error("Failed to generate RAG response", { error });
    return {
      response:
        "I apologize for the inconvenience. I'm experiencing technical difficulties. Please contact Aven support at 1-800-AVEN-HLP (1-800-283-6457) for assistance, or try again later.",
      contexts: [],
    };
  }
}

// Simplified response for quick queries
export async function quickResponse(query: string): Promise<string> {
  try {
    const { response } = await generateRAGResponse(query);
    return response;
  } catch (error) {
    logger.error("Failed to generate quick response", { error });
    return "I'm here to help! However, I'm experiencing some technical issues. Please contact Aven support at 1-800-AVEN-HLP for immediate assistance.";
  }
}

// Get suggested questions based on category
export function getSuggestedQuestions(category?: string): string[] {
  const suggestions = {
    general: [
      "What is Aven and how does it work?",
      "How can I apply for an Aven credit card?",
      "What are the fees associated with Aven?",
      "How does the balance transfer work?",
      "What cashback rewards does Aven offer?",
    ],
    account: [
      "How do I check my balance?",
      "How can I make a payment?",
      "Can I increase my credit limit?",
      "How do I update my personal information?",
      "Where can I find my statements?",
    ],
    support: [
      "How do I report a lost or stolen card?",
      "How can I dispute a charge?",
      "What should I do if I'm having financial difficulties?",
      "How do I contact customer support?",
      "Is my information secure with Aven?",
    ],
    features: [
      "What debt management tools does Aven offer?",
      "How does the mobile app work?",
      "Can I set up automatic payments?",
      "What security features protect my account?",
      "How do I earn and redeem cashback?",
    ],
  };

  return (
    suggestions[category as keyof typeof suggestions] || suggestions.general
  );
}
