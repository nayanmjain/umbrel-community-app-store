"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicProvider = void 0;
class AnthropicProvider {
    config;
    constructor(config) {
        this.config = config;
    }
    async request(endpoint, body) {
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
    async complete(request) {
        const model = request.model || this.config.defaultModel;
        const systemMsg = request.messages.find((m) => m.role === "system");
        const otherMessages = request.messages.filter((m) => m.role !== "system");
        const messages = otherMessages.map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
        }));
        const response = await this.request("messages", {
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
    async test() {
        try {
            const response = await this.request("messages", {
                model: this.config.defaultModel,
                messages: [{ role: "user", content: "Reply with just the word: OK" }],
                max_tokens: 10,
            });
            return {
                success: true,
                message: `Connected successfully. Response: ${response.content?.[0]?.text}`,
            };
        }
        catch (err) {
            return {
                success: false,
                message: `Connection failed: ${err.message}`,
            };
        }
    }
    async listModels() {
        return [this.config.defaultModel];
    }
}
exports.AnthropicProvider = AnthropicProvider;
