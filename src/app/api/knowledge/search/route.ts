import { NextRequest, NextResponse } from "next/server";
import { searchContext } from "@/lib/rag";
import { Logger } from "@/utils/logger";

const logger = new Logger("API:Knowledge:Search");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit = 5 } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    logger.info("Searching knowledge base", { query, limit });

    const results = await searchContext(query, limit);

    logger.info(`Found ${results.length} results`);

    return NextResponse.json({
      query,
      results,
      count: results.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Knowledge search error", { error });
    return NextResponse.json(
      {
        error: "Failed to search knowledge base",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({
      message: 'Provide a query parameter "q" to search the knowledge base',
    });
  }

  try {
    const results = await searchContext(query, 5);
    return NextResponse.json({
      query,
      results,
      count: results.length,
    });
  } catch (error) {
    logger.error("Knowledge search error", { error });
    return NextResponse.json(
      { error: "Failed to search knowledge base" },
      { status: 500 }
    );
  }
}
