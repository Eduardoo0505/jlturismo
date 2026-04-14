import { Router } from "express";
import sql from "../config/db.js";

const router = Router();

/**
 * GET /destinos — lista pacotes ativos (uso público na home).
 */
router.get("/destinos", async (_req, res) => {
  try {
    const rows = await sql`
      SELECT id, nome, descricao, preco, ativo, created_at
      FROM destinos
      WHERE ativo = true
      ORDER BY nome
    `;

    const lista = rows.map((r) => ({
      id: r.id,
      nome: r.nome,
      descricao: r.descricao,
      preco: formatBRL(r.preco),
      precoNumero: Number(r.preco),
      ativo: r.ativo,
    }));

    return res.json(lista);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao listar destinos" });
  }
});

function formatBRL(val) {
  const n = Number(val);
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default router;
