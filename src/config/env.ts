import { z } from "zod";
import { Logger } from "@/utils/logger";

const logger = new Logger("Config:Env");

// Schema for environment variables
const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),

  // OpenAI Configuration
  OPENAI_API_KEY: z.string().optional(),

  // Pinecone Configuration
  PINECONE_API_KEY: z.string().optional(),
  PINECONE_ENVIRONMENT: z.string().optional(),
  PINECONE_INDEX_NAME: z.string().default("aven-knowledge-base"),

  // Exa (web search/scraping) Configuration
  EXA_API_KEY: z.string().optional(),
  EXA_BASE_URL: z.string().default("https://api.exa.ai"),

  // Vapi Configuration
  VAPI_API_KEY: z.string().optional(),
  NEXT_PUBLIC_VAPI_PUBLIC_KEY: z.string().optional(),
  NEXT_PUBLIC_VAPI_ASSISTANT_ID: z.string().optional(),
});

// Function to validate environment variables
const validateEnv = () => {
  try {
    logger.info("Validating environment variables");
    const env = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      PINECONE_API_KEY: process.env.PINECONE_API_KEY,
      PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT,
      PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME,
      EXA_API_KEY: process.env.EXA_API_KEY,
      EXA_BASE_URL: process.env.EXA_BASE_URL || "https://api.exa.ai",
      VAPI_API_KEY: process.env.VAPI_API_KEY,
      NEXT_PUBLIC_VAPI_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY,
      NEXT_PUBLIC_VAPI_ASSISTANT_ID: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID,
    };
    const parsed = envSchema.parse(env);
    logger.info("Environment variables validated successfully");
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((err) => err.path.join("."));
      logger.error("Invalid environment variables", { error: { missingVars } });
      console.warn(
        `⚠️ Missing optional environment variables: ${missingVars.join(
          ", "
        )}. Some features may not work properly.`
      );
      // Return partial env with defaults
      return envSchema.parse({
        NODE_ENV: process.env.NODE_ENV || "development",
        NEXT_PUBLIC_APP_URL:
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
        PINECONE_API_KEY: process.env.PINECONE_API_KEY || "",
        PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT || "",
        PINECONE_INDEX_NAME:
          process.env.PINECONE_INDEX_NAME || "aven-knowledge-base",
        EXA_API_KEY: process.env.EXA_API_KEY || "",
        EXA_BASE_URL: process.env.EXA_BASE_URL || "https://api.exa.ai",
        VAPI_API_KEY: process.env.VAPI_API_KEY || "",
        NEXT_PUBLIC_VAPI_PUBLIC_KEY:
          process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || "",
        NEXT_PUBLIC_VAPI_ASSISTANT_ID:
          process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || "",
      });
    }
    throw error;
  }
};

export const env = validateEnv();
