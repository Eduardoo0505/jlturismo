import { Router } from "express";
import sql from "../config/db.js";
import { authRequired, adminRequired } from "../middleware/auth.js";

const router = Router();

router.use(authRequired, adminRequired);

/**
 * GET /admin/clientes — lista usuários (sem senha).
 */
router.get("/clientes", async (_req, res) => {
  try {
    const rows = await sql`
      SELECT id, nome, email, cpf, telefone, cep, cidade, estado, role, created_at
      FROM usuarios
      ORDER BY created_at DESC
    `;
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao listar clientes" });
  }
});

/**
 * GET /admin/interesses — interesses com nome do destino e e-mail do cliente.
 */
router.get("/interesses", async (_req, res) => {
  try {
    const rows = await sql`
      SELECT i.id, i.status, i.mensagem, i.created_at,
             u.email AS usuario_email, u.nome AS usuario_nome,
             d.nome AS destino_nome, d.preco AS destino_preco
      FROM interesses i
      JOIN usuarios u ON u.id = i.usuario_id
      JOIN destinos d ON d.id = i.destino_id
      ORDER BY i.created_at DESC
    `;
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro ao listar interesses" });
  }
});

export default router;
