"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./api/routes"));
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || "3001", 10);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/v1", routes_1.default);
const pluginDir = process.env.PLUGIN_DIR || path_1.default.join(__dirname, "../../nocodb-plugin");
app.use("/app", express_1.default.static(pluginDir));
app.get("/", (_req, res) => {
    res.sendFile(path_1.default.join(pluginDir, "index.html"));
});
app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Engine running on port ${PORT}`);
});
