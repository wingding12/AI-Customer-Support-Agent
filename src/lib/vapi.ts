import Vapi from "@vapi-ai/web";
import { env } from "@/config/env";
import { Logger } from "@/utils/logger";

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

export function getVapiConfigStatus(): {
  hasPublicKey: boolean;
  hasAssistantId: boolean;
} {
  return {
    hasPublicKey: Boolean(env.NEXT_PUBLIC_VAPI_PUBLIC_KEY),
    hasAssistantId: Boolean(env.NEXT_PUBLIC_VAPI_ASSISTANT_ID),
  };
}

export function getVapiInstance(config?: VapiConfig): Vapi | null {
  const publicKey = config?.publicKey || env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

  if (!publicKey) {
    logger.warn("Vapi public key not configured (NEXT_PUBLIC_VAPI_PUBLIC_KEY)");
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

      // Forward messages to the provided handler. Function-call resolution
      // is handled server-side via the webhook at /api/vapi/webhook.
      vapiInstance.on("message", (message: Record<string, unknown>) => {
        if (config?.onMessage) config.onMessage(message);
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
    throw new Error(
      "Vapi public key missing. Set NEXT_PUBLIC_VAPI_PUBLIC_KEY in your env."
    );
  }

  const id = assistantId || env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

  try {
    if (id) {
      logger.info("Starting voice call with assistant:", id);
      await vapi.start(id);
    } else {
      // Fallback to inline assistant config when no ID is provided
      logger.warn(
        "Assistant ID missing; starting call with inline assistant configuration"
      );
      await vapi.start(avenAssistantConfig as any);
    }
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
