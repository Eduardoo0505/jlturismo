import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import destinosRoutes from "./routes/destinos.routes.js";
import interessesRoutes from "./routes/interesses.routes.js";
import adminRoutes from "./routes/admin.routes.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, servico: "jlturismo-bff" });
});

app.use(authRoutes);
app.use(destinosRoutes);
app.use(interessesRoutes);
app.use("/admin", adminRoutes);

// Swagger: documentação interativa em /api-docs
try {
  const openApiPath = path.join(__dirname, "openapi.yaml");
  const openApiYaml = fs.readFileSync(openApiPath, "utf8");
  const openApiDoc = yaml.load(openApiYaml);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDoc));
} catch (e) {
  console.warn("[swagger] openapi.yaml não carregado:", e.message);
}

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`BFF JL Turismo em http://localhost:${port}`);
  console.log(`Documentação Swagger: http://localhost:${port}/api-docs`);
});
