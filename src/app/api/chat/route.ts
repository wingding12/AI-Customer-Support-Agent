import { NextRequest, NextResponse } from "next/server";
import { generateRAGResponse } from "@/lib/rag";
import { Logger } from "@/utils/logger";

const logger = new Logger("API:Chat");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    logger.info("Processing chat request", { message });

    // Generate response using RAG
    const { response, contexts } = await generateRAGResponse(message, history);

    logger.info("Generated chat response", {
      responseLength: response.length,
      contextsCount: contexts.length,
    });

    return NextResponse.json({
      response,
      contexts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Chat API error", { error });
    return NextResponse.json(
      {
        error: "Failed to process chat message",
        response:
          "I apologize, but I'm having trouble processing your request. Please try again or contact support at 1-800-AVEN-HLP.",
      },
      { status: 500 }
    );
  }
}
