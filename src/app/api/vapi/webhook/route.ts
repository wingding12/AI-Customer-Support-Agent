import { NextRequest, NextResponse } from "next/server";
import { generateRAGResponse } from "@/lib/rag";
import { Logger } from "@/utils/logger";

const logger = new Logger("API:Vapi:Webhook");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    logger.info("Vapi webhook received", { type: body.type });

    // Handle different webhook types
    switch (body.type) {
      case "function-call":
        return handleFunctionCall(body);

      case "assistant-request":
        return handleAssistantRequest();

      case "end-of-call-report":
        return handleEndOfCallReport(body);

      case "status-update":
        return handleStatusUpdate(body);

      case "transcript":
        return handleTranscript(body);

      default:
        logger.warn("Unknown webhook type", { type: body.type });
        return NextResponse.json({ success: true });
    }
  } catch (error) {
    logger.error("Webhook processing error", { error });
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

async function handleFunctionCall(body: {
  functionCall?: { name?: string; parameters?: { query?: string } };
}) {
  const { functionCall } = body;

  if (functionCall?.name === "getAvenInfo") {
    const query = functionCall.parameters?.query || "";
    logger.info("Processing getAvenInfo function", { query });

    try {
      const { response } = await generateRAGResponse(query);

      return NextResponse.json({
        result: response,
      });
    } catch (error) {
      logger.error("Failed to get Aven info", { error });
      return NextResponse.json({
        error: "Failed to retrieve information",
      });
    }
  }

  return NextResponse.json({
    error: "Unknown function",
  });
}

async function handleAssistantRequest() {
  logger.info("Assistant request received");

  // Return the assistant configuration
  return NextResponse.json({
    assistant: {
      firstMessage:
        "Hello! I'm your Aven support assistant. How can I help you today?",
      model: {
        provider: "openai",
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are Aven's AI customer support assistant.
            
            Grounding policy (must follow):
            1) For every user question, first retrieve information from Aven's knowledge base by calling the getAvenInfo function with a clear query derived from the user's request.
            2) Synthesize your answer using ONLY the retrieved context. If the context is insufficient or missing, say so and ask a brief clarifying question, or recommend contacting support.
            3) Do not invent details. Prefer concise, step-by-step guidance.
            4) When appropriate, include next actions (e.g., app navigation steps) and mention support contact.
            
            Fallback defaults (use only if the knowledge base returns nothing relevant):
            - Aven helps people save money while paying off credit card debt.
            - Contact support: 1-800-AVEN-HLP and support@aven.com.
            
            Tone: professional, friendly, and efficient. Keep answers brief unless asked for more.`,
          },
        ],
        functions: [
          {
            name: "getAvenInfo",
            description:
              "Get specific information about Aven products and services",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description:
                    "The user query to search for in the knowledge base",
                },
              },
              required: ["query"],
            },
          },
        ],
      },
      voice: {
        provider: "elevenlabs",
        voiceId: "rachel",
      },
    },
  });
}

async function handleEndOfCallReport(body: {
  duration?: number;
  endedReason?: string;
}) {
  logger.info("End of call report", {
    duration: body.duration,
    endedReason: body.endedReason,
  });

  // Log call metrics for analytics
  return NextResponse.json({ success: true });
}

async function handleStatusUpdate(body: { status?: string }) {
  logger.info("Status update", { status: body.status });
  return NextResponse.json({ success: true });
}

async function handleTranscript(body: {
  transcript?: { role?: string; text?: string };
}) {
  logger.info("Transcript received", {
    role: body.transcript?.role,
    text: body.transcript?.text,
  });
  return NextResponse.json({ success: true });
}
