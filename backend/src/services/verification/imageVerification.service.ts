import {
  ImageVerificationProvider,
  VerificationError,
} from "./imageVerification.types.js";
import { OpenAIVerificationProvider } from "./openai.provider.js";
import { GeminiVerificationProvider } from "./gemini.provider.js";

let provider: ImageVerificationProvider | null = null;

export const getVerificationProvider = (): ImageVerificationProvider => {
  if (provider) {
    return provider;
  }

  const selectedProvider = process.env.AI_PROVIDER?.toLowerCase() || "openai";

  if (selectedProvider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_VISION_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      throw new VerificationError(
        "OPENAI_API_KEY is not configured. Set it in backend/.env to enable AI verification."
      );
    }
    provider = new OpenAIVerificationProvider(apiKey, model);
    return provider;
  }

  if (selectedProvider === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_VISION_MODEL || "gemini-3.6-flash";

    if (!apiKey) {
      throw new VerificationError(
        "GEMINI_API_KEY is not configured. Set it in backend/.env to enable AI verification."
      );
    }
    provider = new GeminiVerificationProvider(apiKey, model);
    return provider;
  }

  throw new VerificationError(`Unknown AI provider: ${selectedProvider}`);
};

export const clearVerificationProvider = (): void => {
  provider = null;
};
