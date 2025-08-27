import { NextRequest, NextResponse } from "next/server";
import { Logger } from "@/utils/logger";

const logger = new Logger("API:Voice:Start");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assistantId } = body;

    logger.info("Starting voice call", { assistantId });

    // Voice call is initiated client-side using Vapi SDK
    // This endpoint can be used for server-side validation or tracking

    return NextResponse.json({
      success: true,
      message: "Voice call initiated",
      assistantId: assistantId || "default",
    });
  } catch (error) {
    logger.error("Failed to start voice call", { error });
    return NextResponse.json(
      {
        success: false,
        error: "Failed to start voice call",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
