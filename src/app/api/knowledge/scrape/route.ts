import { NextRequest, NextResponse } from "next/server";
import { Logger } from "@/utils/logger";
import { ingestAvenKnowledge } from "@/lib/ingest";

const logger = new Logger("API:Knowledge:Scrape");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { limit, clearOld, chunkMaxLength, batchSize } = body || {};

    logger.info("Scrape+Ingest request received", {
      limit,
      clearOld,
      chunkMaxLength,
      batchSize,
    });

    const stats = await ingestAvenKnowledge({
      limit: typeof limit === "number" ? limit : undefined,
      clearOld: typeof clearOld === "boolean" ? clearOld : false,
      chunkMaxLength:
        typeof chunkMaxLength === "number" ? chunkMaxLength : undefined,
      batchSize: typeof batchSize === "number" ? batchSize : undefined,
    });

    return NextResponse.json({
      success: true,
      message: "Scraped and ingested Aven knowledge successfully",
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Scrape+Ingest error", { error });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to scrape and ingest Aven knowledge",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Send a POST request to scrape and ingest Aven knowledge.",
    example: {
      limit: 15,
      clearOld: false,
      chunkMaxLength: 900,
      batchSize: 100,
    },
  });
}
