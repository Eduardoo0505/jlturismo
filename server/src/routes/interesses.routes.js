import { Router } from "express";
import sql from "../config/db.js";
import { authRequired } from "../middleware/auth.js";
import { validar, interesseSchema } from "../middleware/validators.js";

const router = Router();

/**
 * POST /interesses — registra interesse de um usuário autenticado em um destino.
 */
router.post("/interesses", authRequired, validar(interesseSchema), async (req, res, next) => {
  const { destinoId, mensagem } = req.body;

  try {
    const dest = await sql`
      SELECT id FROM destinos WHERE id = ${destinoId} AND ativo = true
    `;
    if (dest.length === 0) {
      return res.status(404).json({ erro: "Destino não encontrado ou inativo" });
    }

    const insert = await sql`
      INSERT INTO interesses (usuario_id, destino_id, mensagem)
      VALUES (${req.user.id}, ${destinoId}, ${mensagem?.trim() || null})
      RETURNING id, status, created_at
    `;

    return res.status(201).json(insert[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
