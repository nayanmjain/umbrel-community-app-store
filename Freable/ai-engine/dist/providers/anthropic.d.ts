import { LLMProviderConfig, LLMCompletionRequest, LLMCompletionResponse } from "../types";
export declare class AnthropicProvider {
    private config;
    constructor(config: LLMProviderConfig);
    private request;
    complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse>;
    test(): Promise<{
        success: boolean;
        message: string;
    }>;
    listModels(): Promise<string[]>;
}
