import crypto from "crypto";
import { Logger } from "@/utils/logger";
import { chunkText, createEmbeddings } from "@/lib/embeddings";
import {
  upsertVectors,
  createIndex,
  deleteAllVectors,
  VectorMetadata,
} from "@/lib/pinecone";
import { scrapeAvenKnowledge, ScrapedDoc } from "@/lib/scraper";

const logger = new Logger("Ingest");

export interface IngestOptions {
  limit?: number;
  clearOld?: boolean;
  chunkMaxLength?: number;
  batchSize?: number;
}

export interface IngestStats {
  docs: number;
  chunks: number;
  upserted: number;
}

function stableHash(input: string): string {
  return crypto.createHash("sha1").update(input).digest("hex");
}

interface ChunkRecord {
  id: string;
  text: string;
  metadata: VectorMetadata;
}

function buildChunksFromDocs(
  docs: ScrapedDoc[],
  chunkMaxLength: number
): ChunkRecord[] {
  const allChunks: ChunkRecord[] = [];
  for (const doc of docs) {
    const parts = chunkText(doc.text, chunkMaxLength);
    const total = parts.length;
    const baseId = `aven:${stableHash(doc.url)}`;

    parts.forEach((part, idx) => {
      const id = `${baseId}:${idx}`;
      const metadata: VectorMetadata = {
        id,
        text: part,
        category: "web",
        topic: "aven",
        url: doc.url,
        title: doc.title,
        source: doc.source,
        chunkIndex: idx,
        chunkCount: total,
      };
      allChunks.push({ id, text: part, metadata });
    });
  }
  return allChunks;
}

async function embedAndUpsert(
  chunks: ChunkRecord[],
  batchSize: number
): Promise<number> {
  let upserted = 0;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const texts = batch.map((b) => b.text);
    const embeddings = await createEmbeddings(texts);
    if (!embeddings) {
      logger.warn("Embedding batch returned null; skipping batch");
      continue;
    }

    const vectors = batch.map((b, j) => ({
      id: b.id,
      values: embeddings[j],
      metadata: b.metadata,
    }));

    await upsertVectors(vectors);
    upserted += vectors.length;
    logger.info(`Upserted batch ${Math.floor(i / batchSize) + 1}`);
  }
  return upserted;
}

export async function ingestDocuments(
  docs: ScrapedDoc[],
  options: IngestOptions = {}
): Promise<IngestStats> {
  const chunkMaxLength = options.chunkMaxLength || 900;
  const batchSize = options.batchSize || 100;

  await createIndex("aven-knowledge-base", 1536, "cosine");

  if (options.clearOld) {
    logger.info("Clearing existing vectors from index");
    await deleteAllVectors("aven-knowledge-base");
  }

  const chunks = buildChunksFromDocs(docs, chunkMaxLength);
  if (chunks.length === 0) {
    return { docs: docs.length, chunks: 0, upserted: 0 };
  }

  const upserted = await embedAndUpsert(chunks, batchSize);
  return { docs: docs.length, chunks: chunks.length, upserted };
}

export async function ingestAvenKnowledge(
  options: IngestOptions = {}
): Promise<IngestStats> {
  const limit = options.limit ?? 15;
  logger.info("Scraping Aven knowledge", { limit });
  const docs = await scrapeAvenKnowledge(limit);
  logger.info("Ingesting scraped documents", { count: docs.length });
  return ingestDocuments(docs, options);
}
