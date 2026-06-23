import { LLMProviderConfig } from "./types";
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = process.env.DATA_DIR || "/data";
const CONFIG_FILE = path.join(DATA_DIR, "providers.json");

interface ConfigData {
  providers: LLMProviderConfig[];
}

function loadConfig(): ConfigData {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch {
    console.warn("Failed to load config, using defaults");
  }
  return { providers: [] };
}

function saveConfig(data: ConfigData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
}

export function getProviders(): LLMProviderConfig[] {
  return loadConfig().providers;
}

export function getProvider(id: string): LLMProviderConfig | undefined {
  return getProviders().find((p) => p.id === id);
}

export function addProvider(provider: LLMProviderConfig): void {
  const config = loadConfig();
  config.providers.push(provider);
  saveConfig(config);
}

export function updateProvider(id: string, updates: Partial<LLMProviderConfig>): boolean {
  const config = loadConfig();
  const index = config.providers.findIndex((p) => p.id === id);
  if (index === -1) return false;
  config.providers[index] = { ...config.providers[index], ...updates };
  saveConfig(config);
  return true;
}

export function deleteProvider(id: string): boolean {
  const config = loadConfig();
  const filtered = config.providers.filter((p) => p.id !== id);
  if (filtered.length === config.providers.length) return false;
  config.providers = filtered;
  saveConfig(config);
  return true;
}

export function generateId(): string {
  return `prov_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
