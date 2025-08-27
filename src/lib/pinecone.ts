import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "@/config/env";
import { Logger } from "@/utils/logger";

const logger = new Logger("Pinecone");

let pineconeClient: Pinecone | null = null;

export async function getPineconeClient(): Promise<Pinecone | null> {
  if (!env.PINECONE_API_KEY) {
    logger.warn("Pinecone API key not configured");
    return null;
  }

  if (!pineconeClient) {
    try {
      pineconeClient = new Pinecone({
        apiKey: env.PINECONE_API_KEY,
      });
      logger.info("Pinecone client initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize Pinecone client", { error });
      return null;
    }
  }

  return pineconeClient;
}

export async function getIndex(indexName?: string) {
  const client = await getPineconeClient();
  if (!client) {
    throw new Error("Pinecone client not available");
  }

  const name = indexName || env.PINECONE_INDEX_NAME;

  try {
    const index = client.index(name);
    logger.info(`Connected to Pinecone index: ${name}`);
    return index;
  } catch (error) {
    logger.error(`Failed to connect to index ${name}`, { error });
    throw error;
  }
}

export type VectorMetadata = {
  id: string;
  text: string;
  category: string;
  topic: string;
  [key: string]: string | number | boolean;
};

export async function upsertVectors(
  vectors: { id: string; values: number[]; metadata: VectorMetadata }[],
  indexName?: string
) {
  try {
    const index = await getIndex(indexName);
    const response = await index.upsert(vectors);
    logger.info(`Upserted ${vectors.length} vectors to Pinecone`);
    return response;
  } catch (error) {
    logger.error("Failed to upsert vectors", { error });
    throw error;
  }
}

export async function queryVectors(
  queryVector: number[],
  topK: number = 5,
  filter?: Record<string, string | number | boolean>,
  indexName?: string
) {
  try {
    const index = await getIndex(indexName);
    const queryResponse = await index.query({
      vector: queryVector,
      topK,
      includeMetadata: true,
      filter,
    });

    logger.info(
      `Queried Pinecone, found ${queryResponse.matches?.length || 0} matches`
    );
    return queryResponse;
  } catch (error) {
    logger.error("Failed to query vectors", { error });
    throw error;
  }
}

export async function deleteAllVectors(indexName?: string) {
  try {
    const index = await getIndex(indexName);
    await index.deleteAll();
    logger.info("Deleted all vectors from Pinecone index");
  } catch (error) {
    logger.error("Failed to delete vectors", { error });
    throw error;
  }
}

export async function createIndex(
  indexName: string,
  dimension: number = 1536, // Default for OpenAI embeddings
  metric: "cosine" | "euclidean" | "dotproduct" = "cosine"
) {
  const client = await getPineconeClient();
  if (!client) {
    throw new Error("Pinecone client not available");
  }

  try {
    const indexes = await client.listIndexes();
    const indexExists = indexes.indexes?.some(
      index => index.name === indexName
    );

    if (indexExists) {
      logger.info(`Index ${indexName} already exists`);
      return;
    }

    await client.createIndex({
      name: indexName,
      dimension,
      metric,
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-west-2",
        },
      },
    });

    logger.info(`Created Pinecone index: ${indexName}`);

    // Wait for index to be ready
    await new Promise(resolve => setTimeout(resolve, 5000));
  } catch (error) {
    logger.error(`Failed to create index ${indexName}`, { error });
    throw error;
  }
}
