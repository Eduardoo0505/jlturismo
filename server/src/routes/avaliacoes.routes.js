// server/src/routes/avaliacoes.routes.js
import { Router } from "express";
import sql from "../config/db.js";
import { authRequired } from "../middleware/auth.js";
import { validar, avaliacaoSchema } from "../middleware/validators.js";

const router = Router();

/**
 * POST /avaliacoes — criar/atualizar avaliação de um destino (usuário logado).
 */
router.post("/avaliacoes", authRequired, validar(avaliacaoSchema), async (req, res, next) => {
  try {
    const { destinoId, nota, comentario } = req.body;

    // Verifica se destino existe
    const [destino] = await sql`SELECT id FROM destinos WHERE id = ${destinoId}`;
    if (!destino) return res.status(404).json({ erro: "Destino não encontrado" });

    // Upsert: cria ou atualiza avaliação
    const [avaliacao] = await sql`
      INSERT INTO avaliacoes (usuario_id, destino_id, nota, comentario)
      VALUES (${req.user.id}, ${destinoId}, ${nota}, ${comentario?.trim() || null})
      ON CONFLICT (usuario_id, destino_id)
      DO UPDATE SET nota = EXCLUDED.nota, comentario = EXCLUDED.comentario
      RETURNING id, nota, comentario, created_at
    `;

    return res.status(201).json(avaliacao);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /avaliacoes/:destinoId — listar avaliações de um destino (público).
 */
router.get("/avaliacoes/:destinoId", async (req, res, next) => {
  try {
    const rows = await sql`
      SELECT a.id, a.nota, a.comentario, a.created_at,
             u.nome AS usuario_nome
      FROM avaliacoes a
      JOIN usuarios u ON u.id = a.usuario_id
      WHERE a.destino_id = ${req.params.destinoId}
      ORDER BY a.created_at DESC
    `;

    // Calcula média
    const total = rows.length;
    const media = total > 0 ? rows.reduce((acc, r) => acc + r.nota, 0) / total : 0;

    return res.json({ avaliacoes: rows, media: Math.round(media * 10) / 10, total });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /avaliacoes/:id — excluir avaliação (somente o dono).
 */
router.delete("/avaliacoes/:id", authRequired, async (req, res, next) => {
  try {
    const result = await sql`
      DELETE FROM avaliacoes
      WHERE id = ${req.params.id} AND usuario_id = ${req.user.id}
      RETURNING id
    `;
    if (result.length === 0) return res.status(404).json({ erro: "Avaliação não encontrada" });
    return res.json({ mensagem: "Avaliação excluída" });
  } catch (err) {
    next(err);
  }
});

export default router;
