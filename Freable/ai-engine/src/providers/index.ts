import { LLMProviderConfig, LLMCompletionRequest, LLMCompletionResponse } from "../types";
import { OpenAICompatibleProvider } from "./openai-compatible";
import { AnthropicProvider } from "./anthropic";

type ProviderInstance = OpenAICompatibleProvider | AnthropicProvider;

export function createProvider(config: LLMProviderConfig): {
  complete: (req: LLMCompletionRequest) => Promise<LLMCompletionResponse>;
  test: () => Promise<{ success: boolean; message: string; models?: string[] }>;
  listModels?: () => Promise<string[]>;
} {
  let instance: ProviderInstance;

  switch (config.type) {
    case "anthropic":
      instance = new AnthropicProvider(config);
      break;
    case "openai-compatible":
    default:
      instance = new OpenAICompatibleProvider(config);
      break;
  }

  return {
    complete: (req) => instance.complete(req),
    test: () => instance.test(),
    listModels: "listModels" in instance ? () => (instance as any).listModels() : undefined,
  };
}

export async function executeWithProvider(
  config: LLMProviderConfig,
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  options?: { model?: string; temperature?: number; maxTokens?: number }
): Promise<LLMCompletionResponse> {
  const provider = createProvider(config);
  return provider.complete({
    providerId: config.id,
    messages,
    ...options,
  });
}
