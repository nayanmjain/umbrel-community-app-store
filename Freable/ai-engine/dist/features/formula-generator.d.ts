import { FormulaRequest, FormulaResponse, LLMProviderConfig } from "../types";
export declare function generateFormula(config: LLMProviderConfig, request: FormulaRequest): Promise<FormulaResponse>;
