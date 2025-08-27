import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { env } from "@/config/env";
import { Logger } from "@/utils/logger";

const logger = new Logger("Embeddings");

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!env.OPENAI_API_KEY) {
    logger.warn("OpenAI API key not configured");
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
    logger.info("OpenAI client initialized");
  }

  return openaiClient;
}

export async function createEmbedding(text: string): Promise<number[] | null> {
  const client = getOpenAIClient();
  if (!client) {
    logger.warn("Cannot create embedding - OpenAI client not available");
    return null;
  }

  try {
    const response = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    const embedding = response.data[0].embedding;
    logger.debug(`Created embedding for text (${text.length} chars)`);
    return embedding;
  } catch (error) {
    logger.error("Failed to create embedding", { error });
    return null;
  }
}

export async function createEmbeddings(
  texts: string[]
): Promise<number[][] | null> {
  const client = getOpenAIClient();
  if (!client) {
    logger.warn("Cannot create embeddings - OpenAI client not available");
    return null;
  }

  try {
    const response = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });

    const embeddings = response.data.map((item) => item.embedding);
    logger.info(`Created ${embeddings.length} embeddings`);
    return embeddings;
  } catch (error) {
    logger.error("Failed to create embeddings", { error });
    return null;
  }
}

export async function generateResponse(
  prompt: string,
  context?: string,
  model: string = "gpt-4-turbo-preview"
): Promise<string | null> {
  const client = getOpenAIClient();
  if (!client) {
    logger.warn("Cannot generate response - OpenAI client not available");
    return null;
  }

  try {
    const systemMessage = `You are an AI customer support agent for Aven, a fintech company that helps people save money while paying off credit card debt. 
    Be helpful, professional, and empathetic. Use the provided context to answer questions accurately.
    If you don't have specific information, provide general guidance and suggest contacting Aven support.`;

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemMessage },
    ];

    if (context) {
      messages.push({
        role: "system",
        content: `Relevant information from our knowledge base:\n${context}`,
      });
    }

    messages.push({ role: "user", content: prompt });

    const response = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const generatedText = response.choices[0].message.content;
    logger.debug("Generated response from OpenAI");
    return generatedText;
  } catch (error) {
    logger.error("Failed to generate response", { error });
    return null;
  }
}

// Chunk text for better embedding quality
export function chunkText(text: string, maxLength: number = 1000): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
