"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeSmartFill = executeSmartFill;
const providers_1 = require("../providers");
async function executeSmartFill(config, request) {
    const contextStr = `
Column Name: ${request.context.columnName}
Column Type: ${request.context.columnType}
Existing values in this column: ${request.context.existingValues.slice(0, 20).join(", ") || "(empty)"}
Row context (other columns): ${JSON.stringify(request.context.rowData, null, 2)}
Number of values to generate: ${request.count}
User description: ${request.description}
`;
    const response = await (0, providers_1.executeWithProvider)(config, [
        {
            role: "system",
            content: `You are a smart data-filling assistant for a spreadsheet database. 
Generate realistic, diverse values for the specified column based on the context provided.
Return ONLY a valid JSON array of strings. Example format: ["value1", "value2", "value3"]
Do not include any other text, explanation, or markdown formatting.`,
        },
        {
            role: "user",
            content: contextStr,
        },
    ]);
    try {
        const cleaned = response.content
            .replace(/```json\s*/gi, "")
            .replace(/```\s*/g, "")
            .trim();
        const values = JSON.parse(cleaned);
        if (Array.isArray(values)) {
            return { values: values.slice(0, request.count) };
        }
        throw new Error("Response was not an array");
    }
    catch {
        const lines = response.content
            .split("\n")
            .map((l) => l.trim())
            .filter((l) => l.startsWith('"') || l.startsWith("'"))
            .map((l) => l.replace(/^["']|["'],?$/g, ""));
        if (lines.length > 0) {
            return { values: lines.slice(0, request.count) };
        }
        return { values: [response.content.trim()] };
    }
}
