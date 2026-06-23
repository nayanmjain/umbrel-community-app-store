import express from "express";
import cors from "cors";
import path from "path";
import routes from "./api/routes";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

app.use(cors());
app.use(express.json());

app.use("/api/v1", routes);

const pluginDir = process.env.PLUGIN_DIR || path.join(__dirname, "../../nocodb-plugin");
app.use("/app", express.static(pluginDir));

app.get("/", (_req, res) => {
  res.sendFile(path.join(pluginDir, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI Engine running on port ${PORT}`);
});
