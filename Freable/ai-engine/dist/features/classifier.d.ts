import { ClassifyRequest, ClassifyResponse, LLMProviderConfig } from "../types";
export declare function classifyValues(config: LLMProviderConfig, request: ClassifyRequest): Promise<ClassifyResponse>;
