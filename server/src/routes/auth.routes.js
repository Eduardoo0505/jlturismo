import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sql from "../config/db.js";

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
router.post("/cadastro", async (req, res) => {
  const { nome, email, senha, cpf, telefone, cep, rua, cidade, estado } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "nome, email e senha são obrigatórios" });
  }

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
    return res.status(201).json({ token, usuario: user });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ erro: "E-mail ou CPF já cadastrado" });
    }
    console.error(err);
    return res.status(500).json({ erro: "Erro ao cadastrar" });
  }
});

/**
 * POST /login — valida credenciais e devolve JWT (o front já usa este caminho e este body).
 */
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "email e senha são obrigatórios" });
  }

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
    return res.json({ token, usuario: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro no login" });
  }
});

export default router;
