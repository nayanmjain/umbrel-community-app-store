import { LLMProviderConfig, LLMChatMessage, LLMCompletionRequest, LLMCompletionResponse } from "../types";

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

interface AnthropicResponse {
  content: Array<{ text: string; type: string }>;
  model: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class AnthropicProvider {
  private config: LLMProviderConfig;

  constructor(config: LLMProviderConfig) {
    this.config = config;
  }

  private async request(endpoint: string, body: unknown): Promise<any> {
    const baseUrl = this.config.baseUrl || "https://api.anthropic.com";
    const response = await fetch(`${baseUrl}/v1/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    return response.json();
  }

  async complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse> {
    const model = request.model || this.config.defaultModel;
    const systemMsg = request.messages.find((m) => m.role === "system");
    const otherMessages = request.messages.filter((m) => m.role !== "system");

    const messages: AnthropicMessage[] = otherMessages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    const response: AnthropicResponse = await this.request("messages", {
      model,
      system: systemMsg?.content,
      messages,
      max_tokens: request.maxTokens ?? 2048,
      temperature: request.temperature ?? 0.7,
    });

    return {
      content: response.content?.[0]?.text || "",
      model: response.model,
      usage: response.usage
        ? {
            promptTokens: response.usage.input_tokens,
            completionTokens: response.usage.output_tokens,
            totalTokens: response.usage.input_tokens + response.usage.output_tokens,
          }
        : undefined,
    };
  }

  async test(): Promise<{ success: boolean; message: string }> {
    try {
      const response: AnthropicResponse = await this.request("messages", {
        model: this.config.defaultModel,
        messages: [{ role: "user", content: "Reply with just the word: OK" }],
        max_tokens: 10,
      });
      return {
        success: true,
        message: `Connected successfully. Response: ${response.content?.[0]?.text}`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Connection failed: ${err.message}`,
      };
    }
  }

  async listModels(): Promise<string[]> {
    return [this.config.defaultModel];
  }
}
