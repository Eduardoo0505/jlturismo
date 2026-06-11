import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sql from "../config/db.js";
import { validar, cadastroSchema, loginSchema } from "../middleware/validators.js";
import { enviarEmail, emailBoasVindas } from "../config/email.js";
import logger from "../config/logger.js";

const router = Router();

function jwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET ausente");
  return s;
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    jwtSecret(),
    { expiresIn: "7d" }
  );
}

/**
 * POST /cadastro — cria usuário com senha hasheada (nunca gravar senha em texto puro).
 */
router.post("/cadastro", validar(cadastroSchema), async (req, res, next) => {
  const { nome, email, senha, cpf, telefone, cep, rua, cidade, estado } = req.body;

  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const result = await sql`
      INSERT INTO usuarios (nome, email, senha_hash, cpf, telefone, cep, rua, cidade, estado)
      VALUES (
        ${nome.trim()},
        ${email.trim().toLowerCase()},
        ${senhaHash},
        ${cpf?.trim() || null},
        ${telefone?.trim() || null},
        ${cep?.trim() || null},
        ${rua?.trim() || null},
        ${cidade?.trim() || null},
        ${estado?.trim() || null}
      )
      RETURNING id, nome, email, role, created_at
    `;

    const user = result[0];
    const token = signToken(user);

    // Envia e-mail de boas-vindas (async, não bloqueia)
    enviarEmail(emailBoasVindas(user.nome, user.email))
      .catch((err) => logger.warn("[auth] Email de boas-vindas falhou:", err.message));

    return res.status(201).json({ token, usuario: user });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ erro: "E-mail ou CPF já cadastrado" });
    }
    next(err);
  }
});

/**
 * POST /login — valida credenciais e devolve JWT (o front já usa este caminho e este body).
 */
router.post("/login", validar(loginSchema), async (req, res, next) => {
  const { email, senha } = req.body;

  try {
    const rows = await sql`
      SELECT id, nome, email, senha_hash, role
      FROM usuarios
      WHERE email = ${email.trim().toLowerCase()}
    `;

    const row = rows[0];
    if (!row) {
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    const ok = await bcrypt.compare(senha, row.senha_hash);
    if (!ok) {
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    const user = {
      id: row.id,
      nome: row.nome,
      email: row.email,
      role: row.role,
    };
    const token = signToken(user);
    logger.info("[auth] Login bem-sucedido:", user.email);
    return res.json({ token, usuario: user });
  } catch (err) {
    next(err);
  }
});

export default router;
