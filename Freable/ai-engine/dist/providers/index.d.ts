import { LLMProviderConfig, LLMCompletionRequest, LLMCompletionResponse } from "../types";
export declare function createProvider(config: LLMProviderConfig): {
    complete: (req: LLMCompletionRequest) => Promise<LLMCompletionResponse>;
    test: () => Promise<{
        success: boolean;
        message: string;
        models?: string[];
    }>;
    listModels?: () => Promise<string[]>;
};
export declare function executeWithProvider(config: LLMProviderConfig, messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
}>, options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
}): Promise<LLMCompletionResponse>;
