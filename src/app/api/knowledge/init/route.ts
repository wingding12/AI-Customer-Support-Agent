import { NextResponse } from "next/server";
import { initializeKnowledgeBase } from "@/lib/rag";
import { Logger } from "@/utils/logger";

const logger = new Logger("API:Knowledge:Init");

export async function POST() {
  try {
    logger.info("Initializing Aven knowledge base");

    const count = await initializeKnowledgeBase();

    logger.info(`Knowledge base initialized with ${count} vectors`);

    return NextResponse.json({
      success: true,
      message: `Knowledge base initialized successfully with ${count} vectors`,
      count,
    });
  } catch (error) {
    logger.error("Failed to initialize knowledge base", { error });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize knowledge base",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Send a POST request to initialize the knowledge base",
  });
}
