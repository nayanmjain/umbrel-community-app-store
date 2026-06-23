"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyValues = classifyValues;
const providers_1 = require("../providers");
async function classifyValues(config, request) {
    const valuesStr = request.values.join("\n");
    const categoriesHint = request.existingCategories
        ? `Existing categories: ${request.existingCategories.join(", ")}. Use these or suggest new ones.`
        : "Suggest appropriate categories based on the data.";
    const response = await (0, providers_1.executeWithProvider)(config, [
        {
            role: "system",
            content: `You are a data classification assistant. Given a list of values from a "${request.columnName}" column, group them into categories.
Return a JSON object with:
- "categories": array of all category names
- "mapping": object mapping each value to its category

Example:
Input values: "Apple", "Banana", "Carrot", "Broccoli", "Chicken", "Beef"
Output: {"categories": ["Fruits", "Vegetables", "Meat"], "mapping": {"Apple": "Fruits", "Banana": "Fruits", "Carrot": "Vegetables", "Broccoli": "Vegetables", "Chicken": "Meat", "Beef": "Meat"}}

${categoriesHint}
Return ONLY valid JSON, no other text.`,
        },
        {
            role: "user",
            content: `Column: ${request.columnName}
Values to classify:\n${valuesStr}`,
        },
    ]);
    try {
        const cleaned = response.content
            .replace(/```json\s*/gi, "")
            .replace(/```\s*/g, "")
            .trim();
        const result = JSON.parse(cleaned);
        return {
            categories: result.categories || [],
            mapping: result.mapping || {},
        };
    }
    catch {
        return {
            categories: ["Uncategorized"],
            mapping: Object.fromEntries(request.values.map((v) => [v, "Uncategorized"])),
        };
    }
}
