import { Router, Request, Response } from "express";
import { getProviders, getProvider, addProvider, updateProvider, deleteProvider, generateId } from "../config";
import { createProvider } from "../providers";
import { executeSmartFill } from "../features/smart-fill";
import { generateFormula } from "../features/formula-generator";
import { classifyValues } from "../features/classifier";
import { parseNaturalLanguageQuery } from "../features/nlp-query";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.get("/providers", (_req: Request, res: Response) => {
  const providers = getProviders().map(({ apiKey, ...p }) => ({
    ...p,
    apiKey: apiKey ? "••••••••" + apiKey.slice(-4) : "",
  }));
  res.json({ providers });
});

router.post("/providers", (req: Request, res: Response) => {
  const { type, name, apiKey, baseUrl, defaultModel } = req.body;
  if (!type || !name || !apiKey) {
    return res.status(400).json({ error: "type, name, and apiKey are required" });
  }
  const provider = {
    id: generateId(),
    type,
    name,
    apiKey,
    baseUrl: baseUrl || "",
    defaultModel: defaultModel || (type === "anthropic" ? "claude-3-5-sonnet-20241022" : "gpt-4o"),
    created_at: new Date().toISOString(),
  };
  addProvider(provider);
  res.status(201).json({ provider: { ...provider, apiKey: "••••••••" + apiKey.slice(-4) } });
});

router.put("/providers/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const updates = req.body;
  const updated = updateProvider(id, updates);
  if (!updated) {
    return res.status(404).json({ error: "Provider not found" });
  }
  res.json({ success: true });
});

router.delete("/providers/:id", (req: Request, res: Response) => {
  const id = req.params.id as string;
  const deleted = deleteProvider(id);
  if (!deleted) {
    return res.status(404).json({ error: "Provider not found" });
  }
  res.json({ success: true });
});

router.post("/providers/test", async (req: Request, res: Response) => {
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
    const provider = createProvider(tempConfig);
    const result = await provider.test();
    res.json(result);
  } catch (err: any) {
    res.json({ success: false, message: err.message });
  }
});

router.post("/smart-fill", async (req: Request, res: Response) => {
  try {
    const { providerId, ...rest } = req.body;
    const config = getProvider(providerId);
    if (!config) {
      return res.status(404).json({ error: "Provider not found" });
    }
    const result = await executeSmartFill(config, rest);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/formula", async (req: Request, res: Response) => {
  try {
    const { providerId, ...rest } = req.body;
    const config = getProvider(providerId);
    if (!config) {
      return res.status(404).json({ error: "Provider not found" });
    }
    const result = await generateFormula(config, rest);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/classify", async (req: Request, res: Response) => {
  try {
    const { providerId, ...rest } = req.body;
    const config = getProvider(providerId);
    if (!config) {
      return res.status(404).json({ error: "Provider not found" });
    }
    const result = await classifyValues(config, rest);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/nlp-query", async (req: Request, res: Response) => {
  try {
    const { providerId, ...rest } = req.body;
    const config = getProvider(providerId);
    if (!config) {
      return res.status(404).json({ error: "Provider not found" });
    }
    const result = await parseNaturalLanguageQuery(config, rest);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { providerId, messages, model, temperature, maxTokens } = req.body;
    const config = getProvider(providerId);
    if (!config) {
      return res.status(404).json({ error: "Provider not found" });
    }
    const provider = createProvider(config);
    const result = await provider.complete({ providerId, messages, model, temperature, maxTokens });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
