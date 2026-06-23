"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProviders = getProviders;
exports.getProvider = getProvider;
exports.addProvider = addProvider;
exports.updateProvider = updateProvider;
exports.deleteProvider = deleteProvider;
exports.generateId = generateId;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const DATA_DIR = process.env.DATA_DIR || "/data";
const CONFIG_FILE = path.join(DATA_DIR, "providers.json");
function loadConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
            return JSON.parse(raw);
        }
    }
    catch {
        console.warn("Failed to load config, using defaults");
    }
    return { providers: [] };
}
function saveConfig(data) {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
}
function getProviders() {
    return loadConfig().providers;
}
function getProvider(id) {
    return getProviders().find((p) => p.id === id);
}
function addProvider(provider) {
    const config = loadConfig();
    config.providers.push(provider);
    saveConfig(config);
}
function updateProvider(id, updates) {
    const config = loadConfig();
    const index = config.providers.findIndex((p) => p.id === id);
    if (index === -1)
        return false;
    config.providers[index] = { ...config.providers[index], ...updates };
    saveConfig(config);
    return true;
}
function deleteProvider(id) {
    const config = loadConfig();
    const filtered = config.providers.filter((p) => p.id !== id);
    if (filtered.length === config.providers.length)
        return false;
    config.providers = filtered;
    saveConfig(config);
    return true;
}
function generateId() {
    return `prov_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
