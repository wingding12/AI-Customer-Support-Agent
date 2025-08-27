import Vapi from "@vapi-ai/web";
import { env } from "@/config/env";
import { Logger } from "@/utils/logger";
import { generateRAGResponse } from "@/lib/rag";

const logger = new Logger("Vapi");

let vapiInstance: Vapi | null = null;

// Track call state internally
let callActive = false;
let muted = false;

export interface VapiConfig {
  publicKey?: string;
  assistantId?: string;
  onMessage?: (message: Record<string, unknown>) => void;
  onCall?: () => void;
  onCallEnd?: () => void;
  onError?: (error: Error) => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onVolumeLevel?: (level: number) => void;
  onTranscript?: (transcript: Record<string, unknown>) => void;
}

export function getVapiInstance(config?: VapiConfig): Vapi | null {
  const publicKey = config?.publicKey || env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

  if (!publicKey) {
    logger.warn("Vapi public key not configured");
    return null;
  }

  if (
    !vapiInstance ||
    (config?.publicKey && config.publicKey !== env.NEXT_PUBLIC_VAPI_PUBLIC_KEY)
  ) {
    try {
      vapiInstance = new Vapi(publicKey);
      logger.info("Vapi instance initialized");

      // Set up event handlers
      if (config?.onMessage) {
        vapiInstance.on("message", config.onMessage);
      }

      if (config?.onCall) {
        vapiInstance.on("call-start", config.onCall);
      }

      if (config?.onCallEnd) {
        vapiInstance.on("call-end", config.onCallEnd);
      }

      if (config?.onError) {
        vapiInstance.on("error", config.onError);
      }

      if (config?.onSpeechStart) {
        vapiInstance.on("speech-start", config.onSpeechStart);
      }

      if (config?.onSpeechEnd) {
        vapiInstance.on("speech-end", config.onSpeechEnd);
      }

      if (config?.onVolumeLevel) {
        vapiInstance.on("volume-level", config.onVolumeLevel);
      }

      // Transcript handling is done through message event
      // if (config?.onTranscript) {
      //   vapiInstance.on('transcript', config.onTranscript);
      // }

      // Set up message handler for RAG integration
      vapiInstance.on("message", async (message: Record<string, unknown>) => {
        if (config?.onMessage) {
          config.onMessage(message);
        }

        // Handle function calls for RAG integration
        const messageType = message.type as string;
        const functionCall = message.functionCall as
          | { name?: string; parameters?: { query?: string } }
          | undefined;

        if (
          messageType === "function-call" &&
          functionCall?.name === "getAvenInfo"
        ) {
          const query = functionCall.parameters?.query || "";
          logger.info("Processing Vapi function call for query:", query);

          try {
            await generateRAGResponse(query);
            // Vapi will handle the function result through webhook
            logger.info("Generated response for Vapi function call");
          } catch (error) {
            logger.error("Failed to process Vapi query", { error });
          }
        }
      });
    } catch (error) {
      logger.error("Failed to initialize Vapi", { error });
      return null;
    }
  }

  return vapiInstance;
}

export async function startVoiceCall(assistantId?: string): Promise<void> {
  const vapi = getVapiInstance();
  if (!vapi) {
    throw new Error("Vapi not initialized");
  }

  const id = assistantId || env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
  if (!id) {
    throw new Error("Assistant ID not configured");
  }

  try {
    logger.info("Starting voice call with assistant:", id);
    await vapi.start(id);
    callActive = true;
    muted = false;
  } catch (error) {
    logger.error("Failed to start voice call", { error });
    callActive = false;
    throw error;
  }
}

export async function stopVoiceCall(): Promise<void> {
  const vapi = getVapiInstance();
  if (!vapi) {
    throw new Error("Vapi not initialized");
  }

  try {
    logger.info("Stopping voice call");
    vapi.stop();
    callActive = false;
    muted = false;
  } catch (error) {
    logger.error("Failed to stop voice call", { error });
    throw error;
  }
}

export function isCallActive(): boolean {
  return callActive;
}

export function isMuted(): boolean {
  return muted;
}

export function toggleMute(): void {
  const vapi = getVapiInstance();
  if (!vapi) {
    logger.warn("Cannot toggle mute - Vapi not initialized");
    return;
  }

  if (muted) {
    vapi.setMuted(false);
    muted = false;
    logger.info("Unmuted microphone");
  } else {
    vapi.setMuted(true);
    muted = true;
    logger.info("Muted microphone");
  }
}

export function sendMessage(message: string): void {
  const vapi = getVapiInstance();
  if (!vapi) {
    logger.warn("Cannot send message - Vapi not initialized");
    return;
  }

  // Use 'say' to make the assistant speak the message
  vapi.send({
    type: "say",
    message,
  });
  logger.debug("Sent message to Vapi:", message);
}

// Create assistant configuration for Aven support
export const avenAssistantConfig = {
  name: "Aven Support Assistant",
  model: {
    provider: "openai",
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: `You are an AI customer support assistant for Aven, a fintech company that helps people save money while paying off credit card debt. 
        
        Your role is to:
        1. Answer questions about Aven's products and services
        2. Help users with account-related inquiries
        3. Provide information about our credit card, balance transfers, and rewards
        4. Assist with technical issues and general support
        
        Be professional, friendly, and empathetic. If you don't know something specific, suggest contacting our support team at 1-800-AVEN-HLP.
        
        Key information:
        - 0% APR on balance transfers for 21 months
        - No annual fee
        - 3% cashback on groceries, 2% on gas
        - Mobile app available for iOS and Android
        - 24/7 customer support`,
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
              description: "The user query to search for in the knowledge base",
            },
          },
          required: ["query"],
        },
      },
    ],
  },
  voice: {
    provider: "elevenlabs",
    voiceId: "rachel", // Professional female voice
    stability: 0.8,
    similarityBoost: 0.9,
  },
  firstMessage:
    "Hello! I'm your Aven support assistant. How can I help you today?",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
};
