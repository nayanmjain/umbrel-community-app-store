"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseNaturalLanguageQuery = parseNaturalLanguageQuery;
const providers_1 = require("../providers");
async function parseNaturalLanguageQuery(config, request) {
    const tableSchema = request.tableInfo.columns
        .map((c) => `  - ${c.name} (${c.type})`)
        .join("\n");
    const sampleRows = request.tableInfo.sampleData.slice(0, 3);
    const samplesStr = sampleRows.length > 0
        ? "Sample rows:\n" + sampleRows.map((r) => JSON.stringify(r)).join("\n")
        : "(no sample data)";
    const response = await (0, providers_1.executeWithProvider)(config, [
        {
            role: "system",
            content: `You are a natural language to database query assistant for NocoDB.
Convert the user's natural language request into filter/sort criteria.

The table "${request.tableInfo.name}" has these columns:
${tableSchema}

${samplesStr}

Return a JSON object with:
- "filter": a filter object or null (format: {field, operator, value} or {logical: "and"|"or", conditions: [...]})
- "sort": array of sort objects or null (format: [{field: "column_name", direction: "asc"|"desc"}])
- "explanation": a brief explanation in natural language of what the query will do

Supported operators: "eq", "neq", "gt", "gte", "lt", "lte", "contains", "notContains", "startsWith", "endsWith", "isEmpty", "isNotEmpty", "isNull", "isNotNull"

Return ONLY valid JSON, no other text.`,
        },
        {
            role: "user",
            content: `Query: ${request.query}

Convert this to filter/sort criteria for the "${request.tableInfo.name}" table.`,
        },
    ]);
    try {
        const cleaned = response.content
            .replace(/```json\s*/gi, "")
            .replace(/```\s*/g, "")
            .trim();
        const result = JSON.parse(cleaned);
        return {
            filter: result.filter || undefined,
            sort: result.sort || undefined,
            explanation: result.explanation || "Query processed successfully.",
        };
    }
    catch {
        return {
            explanation: `Could not parse query. Raw AI response: ${response.content.substring(0, 300)}`,
        };
    }
}
