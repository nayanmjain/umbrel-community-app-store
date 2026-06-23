"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFormula = generateFormula;
const providers_1 = require("../providers");
async function generateFormula(config, request) {
    const columnsInfo = request.columnNames
        .map((name) => `${name} (${request.columnTypes[name] || "unknown"})`)
        .join(", ");
    const response = await (0, providers_1.executeWithProvider)(config, [
        {
            role: "system",
            content: `You are a formula generation assistant for NocoDB, a spreadsheet-database platform.
NocoDB supports formulas similar to Excel/Google Sheets.
Given a description and available columns, generate the appropriate formula.

Return a JSON object with:
- "formula": the formula expression (e.g., "({revenue} - {cost}) / {cost} * 100")
- "explanation": a brief explanation of what the formula does

Column references should use curly braces: {column_name}
Available functions: IF, SUM, COUNT, AVERAGE, MIN, MAX, ROUND, CONCATENATE, DATETIME_DIFF, DATEADD, NOW, TODAY, YEAR, MONTH, DAY, ABS, LEN, LOWER, UPPER, TRIM, LEFT, RIGHT, MID, SEARCH, REPLACE, & (concatenation)
Operators: +, -, *, /, >, <, >=, <=, =, !=, &&, ||

Return ONLY valid JSON, no other text.`,
        },
        {
            role: "user",
            content: `Available columns: ${columnsInfo}
Description: ${request.description}
Generate the formula.`,
        },
    ]);
    try {
        const cleaned = response.content
            .replace(/```json\s*/gi, "")
            .replace(/```\s*/g, "")
            .trim();
        const result = JSON.parse(cleaned);
        return {
            formula: result.formula || "",
            explanation: result.explanation || "",
        };
    }
    catch {
        const formulaMatch = response.content.match(/\{.*?=.*?\}/);
        if (formulaMatch) {
            return {
                formula: formulaMatch[0],
                explanation: response.content.substring(0, 200),
            };
        }
        return {
            formula: response.content.trim(),
            explanation: "Generated formula - please verify it matches your intent.",
        };
    }
}
