import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import swaggerUi from "swagger-ui-express";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import destinosRoutes from "./routes/destinos.routes.js";
import interessesRoutes from "./routes/interesses.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import pagamentosRouter from "./routes/pagamentos.js";
import contatosRoutes from "./routes/contatos.routes.js";
import avaliacoesRoutes from "./routes/avaliacoes.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import { authRequired } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import logger from "./config/logger.js";
import { inicializarBanco } from "./config/dbInit.js";

dotenv.config();

// Executa migrações e sementes do banco de dados de forma assíncrona no startup
inicializarBanco();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://jlturismo.vercel.app",
    process.env.CORS_ORIGIN,
  ].filter(Boolean),
  credentials: true,
}));

app.use(express.json());

// Log de requisições recebidas
app.use((req, res, next) => {
  logger.info(`[HTTP] ${req.method} ${req.url} - de ${req.headers.origin || 'host'}`);
  next();
});

// Rate limiting em rotas sensíveis (login e cadastro)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 tentativas por janela
  message: { erro: "Muitas tentativas. Aguarde 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ ok: true, servico: "jlturismo-bff", timestamp: new Date().toISOString() });
});

// Rotas públicas (com rate limit no login/cadastro)
app.use("/login", authLimiter);
app.use("/cadastro", authLimiter);
app.use(authRoutes);
app.use(destinosRoutes);
app.use(interessesRoutes);
app.use(contatosRoutes);     // POST /contatos — público
app.use(avaliacoesRoutes);   // GET /avaliacoes/:id — público, POST requer auth

// Rotas privadas (exigem login)
app.use("/api/pagamentos", authRequired, pagamentosRouter);
app.use(usuariosRoutes);     // /perfil, /perfil/senha, /perfil/interesses, /perfil/pagamentos

// Rotas admin (exigem login + role admin)
app.use("/admin", adminRoutes);

// Swagger: documentação interativa em /api-docs
try {
  const openApiPath = path.join(__dirname, "openapi.yaml");
  const openApiYaml = fs.readFileSync(openApiPath, "utf8");
  const openApiDoc = yaml.load(openApiYaml);
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDoc));
} catch (e) {
  logger.warn("[swagger] openapi.yaml não carregado:", e.message);
}

// Middleware global de erros (deve ser o último)
app.use(errorHandler);

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  logger.info(`BFF E&Y Turismo em http://localhost:${port}`);
  logger.info(`Documentação Swagger: http://localhost:${port}/api-docs`);
});
