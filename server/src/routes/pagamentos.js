// server/src/routes/pagamentos.js
import { Router } from "express";
import sql from "../config/db.js";
import { validar, pagamentoSchema } from "../middleware/validators.js";
import { enviarEmail, emailPagamentoConfirmado } from "../config/email.js";
import logger from "../config/logger.js";

const router = Router();

/**
 * POST /api/pagamentos — registrar pagamento (usuário logado).
 */
router.post("/", validar(pagamentoSchema), async (req, res, next) => {
  try {
    const { pacoteId, pacoteNome, valor, metodo } = req.body;
    const usuarioId = req.user.id;

    // Gera código de reserva único
    const codigoReserva = `EY-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Simula processamento (1s)
    await new Promise((r) => setTimeout(r, 1000));

    // Persiste no banco
    const [pagamento] = await sql`
      INSERT INTO pagamentos (usuario_id, destino_id, valor, metodo, status, codigo_reserva, pacote_nome)
      VALUES (
        ${usuarioId},
        ${pacoteId.length === 36 ? pacoteId : null},
        ${valor},
        ${metodo},
        'aprovado',
        ${codigoReserva},
        ${pacoteNome}
      )
      RETURNING id, status, codigo_reserva, valor, metodo, pacote_nome, created_at
    `;

    // Envia e-mail de confirmação (async, não bloqueia a resposta)
    try {
      const [usuario] = await sql`SELECT nome, email FROM usuarios WHERE id = ${usuarioId}`;
      if (usuario) {
        const emailData = emailPagamentoConfirmado(
          usuario.nome, usuario.email, pacoteNome, codigoReserva, valor
        );
        enviarEmail(emailData).catch((err) => logger.error("[pagamentos] Falha no email:", err.message));
      }
    } catch (emailErr) {
      logger.warn("[pagamentos] Não enviou e-mail:", emailErr.message);
    }

    return res.status(201).json(pagamento);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/pagamentos — histórico de pagamentos do usuário logado.
 */
router.get("/", async (req, res, next) => {
  try {
    const rows = await sql`
      SELECT id, status, codigo_reserva, valor, metodo, pacote_nome, created_at
      FROM pagamentos
      WHERE usuario_id = ${req.user.id}
      ORDER BY created_at DESC
    `;
    return res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/pagamentos/:id — detalhe de um pagamento.
 */
router.get("/:id", async (req, res, next) => {
  try {
    const [row] = await sql`
      SELECT id, status, codigo_reserva, valor, metodo, pacote_nome, created_at
      FROM pagamentos
      WHERE id = ${req.params.id} AND usuario_id = ${req.user.id}
    `;
    if (!row) return res.status(404).json({ erro: "Pagamento não encontrado" });
    return res.json(row);
  } catch (err) {
    next(err);
  }
});

export default router;