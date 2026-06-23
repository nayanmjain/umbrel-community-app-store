import { SmartFillRequest, SmartFillResponse, LLMProviderConfig } from "../types";
export declare function executeSmartFill(config: LLMProviderConfig, request: SmartFillRequest): Promise<SmartFillResponse>;
