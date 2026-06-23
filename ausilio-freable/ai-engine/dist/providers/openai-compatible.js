"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAICompatibleProvider = void 0;
const openai_1 = __importDefault(require("openai"));
class OpenAICompatibleProvider {
    client;
    config;
    constructor(config) {
        this.config = config;
        this.client = new openai_1.default({
            apiKey: config.apiKey,
            baseURL: config.baseUrl || "https://api.openai.com/v1",
        });
    }
    async complete(request) {
        const model = request.model || this.config.defaultModel;
        const response = await this.client.chat.completions.create({
            model,
            messages: request.messages,
            temperature: request.temperature ?? 0.7,
            max_tokens: request.maxTokens ?? 2048,
        });
        const choice = response.choices[0];
        return {
            content: choice?.message?.content || "",
            model: response.model,
            usage: response.usage
                ? {
                    promptTokens: response.usage.prompt_tokens,
                    completionTokens: response.usage.completion_tokens,
                    totalTokens: response.usage.total_tokens,
                }
                : undefined,
        };
    }
    async test() {
        try {
            const response = await this.client.chat.completions.create({
                model: this.config.defaultModel,
                messages: [{ role: "user", content: "Reply with just the word: OK" }],
                max_tokens: 10,
            });
            return {
                success: true,
                message: `Connected successfully. Response: ${response.choices[0]?.message?.content}`,
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
        try {
            const models = await this.client.models.list();
            return models.data.map((m) => m.id);
        }
        catch {
            return [this.config.defaultModel];
        }
    }
}
exports.OpenAICompatibleProvider = OpenAICompatibleProvider;
