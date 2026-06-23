"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProvider = createProvider;
exports.executeWithProvider = executeWithProvider;
const openai_compatible_1 = require("./openai-compatible");
const anthropic_1 = require("./anthropic");
function createProvider(config) {
    let instance;
    switch (config.type) {
        case "anthropic":
            instance = new anthropic_1.AnthropicProvider(config);
            break;
        case "openai-compatible":
        default:
            instance = new openai_compatible_1.OpenAICompatibleProvider(config);
            break;
    }
    return {
        complete: (req) => instance.complete(req),
        test: () => instance.test(),
        listModels: "listModels" in instance ? () => instance.listModels() : undefined,
    };
}
async function executeWithProvider(config, messages, options) {
    const provider = createProvider(config);
    return provider.complete({
        providerId: config.id,
        messages,
        ...options,
    });
}
