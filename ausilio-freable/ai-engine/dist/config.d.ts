import { LLMProviderConfig } from "./types";
export declare function getProviders(): LLMProviderConfig[];
export declare function getProvider(id: string): LLMProviderConfig | undefined;
export declare function addProvider(provider: LLMProviderConfig): void;
export declare function updateProvider(id: string, updates: Partial<LLMProviderConfig>): boolean;
export declare function deleteProvider(id: string): boolean;
export declare function generateId(): string;
