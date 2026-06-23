"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const config_1 = require("../config");
const providers_1 = require("../providers");
const smart_fill_1 = require("../features/smart-fill");
const formula_generator_1 = require("../features/formula-generator");
const classifier_1 = require("../features/classifier");
const nlp_query_1 = require("../features/nlp-query");
const router = (0, express_1.Router)();
router.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});
router.get("/providers", (_req, res) => {
    const providers = (0, config_1.getProviders)().map(({ apiKey, ...p }) => ({
        ...p,
        apiKey: apiKey ? "••••••••" + apiKey.slice(-4) : "",
    }));
    res.json({ providers });
});
router.post("/providers", (req, res) => {
    const { type, name, apiKey, baseUrl, defaultModel } = req.body;
    if (!type || !name || !apiKey) {
        return res.status(400).json({ error: "type, name, and apiKey are required" });
    }
    const provider = {
        id: (0, config_1.generateId)(),
        type,
        name,
        apiKey,
        baseUrl: baseUrl || "",
        defaultModel: defaultModel || (type === "anthropic" ? "claude-3-5-sonnet-20241022" : "gpt-4o"),
        created_at: new Date().toISOString(),
    };
    (0, config_1.addProvider)(provider);
    res.status(201).json({ provider: { ...provider, apiKey: "••••••••" + apiKey.slice(-4) } });
});
router.put("/providers/:id", (req, res) => {
    const id = req.params.id;
    const updates = req.body;
    const updated = (0, config_1.updateProvider)(id, updates);
    if (!updated) {
        return res.status(404).json({ error: "Provider not found" });
    }
    res.json({ success: true });
});
router.delete("/providers/:id", (req, res) => {
    const id = req.params.id;
    const deleted = (0, config_1.deleteProvider)(id);
    if (!deleted) {
        return res.status(404).json({ error: "Provider not found" });
    }
    res.json({ success: true });
});
router.post("/providers/test", async (req, res) => {
    try {
        const { type, apiKey, baseUrl, model } = req.body;
        if (!type || !apiKey) {
            return res.status(400).json({ error: "type and apiKey are required" });
        }
        const tempConfig = {
            id: "test",
            type,
            name: "test",
            apiKey,
            baseUrl: baseUrl || "",
            defaultModel: model || (type === "anthropic" ? "claude-3-5-sonnet-20241022" : "gpt-4o"),
            created_at: new Date().toISOString(),
        };
        const provider = (0, providers_1.createProvider)(tempConfig);
        const result = await provider.test();
        res.json(result);
    }
    catch (err) {
        res.json({ success: false, message: err.message });
    }
});
router.post("/smart-fill", async (req, res) => {
    try {
        const { providerId, ...rest } = req.body;
        const config = (0, config_1.getProvider)(providerId);
        if (!config) {
            return res.status(404).json({ error: "Provider not found" });
        }
        const result = await (0, smart_fill_1.executeSmartFill)(config, rest);
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post("/formula", async (req, res) => {
    try {
        const { providerId, ...rest } = req.body;
        const config = (0, config_1.getProvider)(providerId);
        if (!config) {
            return res.status(404).json({ error: "Provider not found" });
        }
        const result = await (0, formula_generator_1.generateFormula)(config, rest);
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post("/classify", async (req, res) => {
    try {
        const { providerId, ...rest } = req.body;
        const config = (0, config_1.getProvider)(providerId);
        if (!config) {
            return res.status(404).json({ error: "Provider not found" });
        }
        const result = await (0, classifier_1.classifyValues)(config, rest);
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post("/nlp-query", async (req, res) => {
    try {
        const { providerId, ...rest } = req.body;
        const config = (0, config_1.getProvider)(providerId);
        if (!config) {
            return res.status(404).json({ error: "Provider not found" });
        }
        const result = await (0, nlp_query_1.parseNaturalLanguageQuery)(config, rest);
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post("/chat", async (req, res) => {
    try {
        const { providerId, messages, model, temperature, maxTokens } = req.body;
        const config = (0, config_1.getProvider)(providerId);
        if (!config) {
            return res.status(404).json({ error: "Provider not found" });
        }
        const provider = (0, providers_1.createProvider)(config);
        const result = await provider.complete({ providerId, messages, model, temperature, maxTokens });
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
