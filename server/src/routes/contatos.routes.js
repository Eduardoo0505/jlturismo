// server/src/routes/contatos.routes.js
import { Router } from "express";
import sql from "../config/db.js";
import { validar, contatoSchema } from "../middleware/validators.js";

const router = Router();

/**
 * POST /contatos — salvar mensagem de contato (público, sem login).
 */
router.post("/contatos", validar(contatoSchema), async (req, res, next) => {
  try {
    const { nome, email, mensagem } = req.body;

    const [contato] = await sql`
      INSERT INTO contatos (nome, email, mensagem)
      VALUES (${nome.trim()}, ${email.trim().toLowerCase()}, ${mensagem.trim()})
      RETURNING id, created_at
    `;

    return res.status(201).json({ mensagem: "Mensagem enviada com sucesso!", id: contato.id });
  } catch (err) {
    next(err);
  }
});

export default router;
