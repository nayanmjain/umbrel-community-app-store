import { NLPQueryRequest, NLPQueryResponse, LLMProviderConfig } from "../types";
export declare function parseNaturalLanguageQuery(config: LLMProviderConfig, request: NLPQueryRequest): Promise<NLPQueryResponse>;
