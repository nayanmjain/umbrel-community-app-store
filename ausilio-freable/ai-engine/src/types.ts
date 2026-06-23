export type LLMProviderType = "openai-compatible" | "anthropic";

export interface LLMProviderConfig {
  id: string;
  type: LLMProviderType;
  name: string;
  apiKey: string;
  baseUrl?: string;
  defaultModel: string;
  created_at: string;
}

export interface LLMChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMCompletionRequest {
  providerId: string;
  messages: LLMChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMCompletionResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface SmartFillRequest {
  providerId: string;
  model?: string;
  context: {
    columnName: string;
    columnType: string;
    existingValues: string[];
    rowData: Record<string, string>;
  };
  description: string;
  count: number;
}

export interface SmartFillResponse {
  values: string[];
}

export interface FormulaRequest {
  providerId: string;
  model?: string;
  description: string;
  columnNames: string[];
  columnTypes: Record<string, string>;
}

export interface FormulaResponse {
  formula: string;
  explanation: string;
}

export interface ClassifyRequest {
  providerId: string;
  model?: string;
  columnName: string;
  values: string[];
  existingCategories?: string[];
}

export interface ClassifyResponse {
  categories: string[];
  mapping: Record<string, string>;
}

export interface NLPQueryRequest {
  providerId: string;
  model?: string;
  query: string;
  tableInfo: {
    name: string;
    columns: { name: string; type: string }[];
    sampleData: Record<string, string>[];
  };
}

export interface NLPQueryResponse {
  filter?: Record<string, unknown>;
  sort?: { field: string; direction: "asc" | "desc" }[];
  explanation: string;
}

export interface ProviderTestRequest {
  type: LLMProviderType;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export interface ProviderTestResponse {
  success: boolean;
  message: string;
  models?: string[];
}
