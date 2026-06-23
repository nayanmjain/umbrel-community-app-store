import { LLMProviderConfig, LLMCompletionRequest, LLMCompletionResponse } from "../types";
export declare class OpenAICompatibleProvider {
    private client;
    private config;
    constructor(config: LLMProviderConfig);
    complete(request: LLMCompletionRequest): Promise<LLMCompletionResponse>;
    test(): Promise<{
        success: boolean;
        message: string;
        models?: string[];
    }>;
    listModels(): Promise<string[]>;
}
