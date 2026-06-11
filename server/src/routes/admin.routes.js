// server/src/routes/admin.routes.js
import { Router } from "express";
import sql from "../config/db.js";
import { authRequired, adminRequired } from "../middleware/auth.js";
import { validar, destinoSchema } from "../middleware/validators.js";
import { paginar } from "../middleware/pagination.js";

const router = Router();

router.use(authRequired, adminRequired);

// ======================== DASHBOARD ========================

/**
 * GET /admin/dashboard — estatísticas gerais do sistema.
 */
router.get("/dashboard", async (_req, res, next) => {
  try {
    const [[{ total_usuarios }]] = await Promise.all([
      sql`SELECT count(*)::int AS total_usuarios FROM usuarios`,
    ]);
    const [{ total_destinos }] = await sql`SELECT count(*)::int AS total_destinos FROM destinos WHERE ativo = true`;
    const [{ total_interesses }] = await sql`SELECT count(*)::int AS total_interesses FROM interesses`;
    const [{ total_pagamentos }] = await sql`SELECT count(*)::int AS total_pagamentos FROM pagamentos`;
    const [{ receita_total }] = await sql`SELECT COALESCE(SUM(valor), 0)::numeric AS receita_total FROM pagamentos WHERE status = 'aprovado'`;
    const [{ total_contatos }] = await sql`SELECT count(*)::int AS total_contatos FROM contatos WHERE lido = false`;
    const [{ total_avaliacoes }] = await sql`SELECT count(*)::int AS total_avaliacoes FROM avaliacoes`;

    // Últimos interesses
    const ultimos_interesses = await sql`
      SELECT i.id, i.status, i.created_at,
             u.nome AS usuario, d.nome AS destino
      FROM interesses i
      JOIN usuarios u ON u.id = i.usuario_id
      JOIN destinos d ON d.id = i.destino_id
      ORDER BY i.created_at DESC LIMIT 5
    `;

    // Últimos pagamentos
    const ultimos_pagamentos = await sql`
      SELECT p.id, p.status, p.valor, p.metodo, p.pacote_nome, p.codigo_reserva, p.created_at,
             u.nome AS usuario
      FROM pagamentos p
      JOIN usuarios u ON u.id = p.usuario_id
      ORDER BY p.created_at DESC LIMIT 5
    `;

    return res.json({
      total_usuarios,
      total_destinos,
      total_interesses,
      total_pagamentos,
      receita_total: Number(receita_total),
      total_contatos_nao_lidos: total_contatos,
      total_avaliacoes,
      ultimos_interesses,
      ultimos_pagamentos,
    });
  } catch (err) {
    next(err);
  }
});

// ======================== CLIENTES ========================

/**
 * GET /admin/clientes — listar usuários com paginação.
 */
router.get("/clientes", async (req, res, next) => {
  try {
    const { limit, offset, paginado } = paginar(req);
    const rows = await sql`
      SELECT id, nome, email, cpf, telefone, cep, cidade, estado, role, created_at
      FROM usuarios
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const [{ total }] = await sql`SELECT count(*)::int AS total FROM usuarios`;
    return res.json(paginado(rows, total));
  } catch (err) {
    next(err);
  }
});

// ======================== DESTINOS CRUD ========================

/**
 * GET /admin/destinos — listar TODOS os destinos (ativos e inativos).
 */
router.get("/destinos", async (req, res, next) => {
  try {
    const { limit, offset, paginado } = paginar(req);
    const rows = await sql`
      SELECT id, nome, descricao, preco, ativo, created_at
      FROM destinos
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const [{ total }] = await sql`SELECT count(*)::int AS total FROM destinos`;
    return res.json(paginado(rows, total));
  } catch (err) {
    next(err);
  }
});

/**
 * POST /admin/destinos — criar destino.
 */
router.post("/destinos", validar(destinoSchema), async (req, res, next) => {
  try {
    const { nome, descricao, preco, ativo } = req.body;
    const [destino] = await sql`
      INSERT INTO destinos (nome, descricao, preco, ativo)
      VALUES (${nome.trim()}, ${descricao.trim()}, ${preco}, ${ativo ?? true})
      RETURNING id, nome, descricao, preco, ativo, created_at
    `;
    return res.status(201).json(destino);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /admin/destinos/:id — editar destino.
 */
router.put("/destinos/:id", validar(destinoSchema), async (req, res, next) => {
  try {
    const { nome, descricao, preco, ativo } = req.body;
    const [destino] = await sql`
      UPDATE destinos
      SET nome = ${nome.trim()}, descricao = ${descricao.trim()}, preco = ${preco}, ativo = ${ativo ?? true}
      WHERE id = ${req.params.id}
      RETURNING id, nome, descricao, preco, ativo, created_at
    `;
    if (!destino) return res.status(404).json({ erro: "Destino não encontrado" });
    return res.json(destino);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /admin/destinos/:id/ativo — ativar/desativar destino.
 */
router.patch("/destinos/:id/ativo", async (req, res, next) => {
  try {
    const { ativo } = req.body;
    if (typeof ativo !== "boolean") return res.status(400).json({ erro: "Campo 'ativo' (boolean) é obrigatório" });
    const [destino] = await sql`
      UPDATE destinos SET ativo = ${ativo}
      WHERE id = ${req.params.id}
      RETURNING id, nome, ativo
    `;
    if (!destino) return res.status(404).json({ erro: "Destino não encontrado" });
    return res.json(destino);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /admin/destinos/:id — excluir destino.
 */
router.delete("/destinos/:id", async (req, res, next) => {
  try {
    const result = await sql`DELETE FROM destinos WHERE id = ${req.params.id} RETURNING id`;
    if (result.length === 0) return res.status(404).json({ erro: "Destino não encontrado" });
    return res.json({ mensagem: "Destino excluído" });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(409).json({ erro: "Não é possível excluir: há interesses ou pagamentos vinculados. Desative o destino." });
    }
    next(err);
  }
});

// ======================== INTERESSES ========================

/**
 * GET /admin/interesses — listar interesses com dados do usuário e destino.
 */
router.get("/interesses", async (req, res, next) => {
  try {
    const { limit, offset, paginado } = paginar(req);
    const rows = await sql`
      SELECT i.id, i.status, i.mensagem, i.created_at,
             u.email AS usuario_email, u.nome AS usuario_nome,
             d.nome AS destino_nome, d.preco AS destino_preco
      FROM interesses i
      JOIN usuarios u ON u.id = i.usuario_id
      JOIN destinos d ON d.id = i.destino_id
      ORDER BY i.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const [{ total }] = await sql`SELECT count(*)::int AS total FROM interesses`;
    return res.json(paginado(rows, total));
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /admin/interesses/:id/status — alterar status do interesse.
 */
router.patch("/interesses/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["novo", "contatado", "convertido"].includes(status)) {
      return res.status(400).json({ erro: "Status inválido. Use: novo, contatado, convertido" });
    }
    const [interesse] = await sql`
      UPDATE interesses SET status = ${status}
      WHERE id = ${req.params.id}
      RETURNING id, status
    `;
    if (!interesse) return res.status(404).json({ erro: "Interesse não encontrado" });
    return res.json(interesse);
  } catch (err) {
    next(err);
  }
});

// ======================== PAGAMENTOS ========================

/**
 * GET /admin/pagamentos — listar todos os pagamentos.
 */
router.get("/pagamentos", async (req, res, next) => {
  try {
    const { limit, offset, paginado } = paginar(req);
    const rows = await sql`
      SELECT p.id, p.status, p.valor, p.metodo, p.codigo_reserva, p.pacote_nome, p.created_at,
             u.nome AS usuario_nome, u.email AS usuario_email
      FROM pagamentos p
      JOIN usuarios u ON u.id = p.usuario_id
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const [{ total }] = await sql`SELECT count(*)::int AS total FROM pagamentos`;
    return res.json(paginado(rows, total));
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /admin/pagamentos/:id/status — alterar status do pagamento.
 */
router.patch("/pagamentos/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["pendente", "aprovado", "recusado", "cancelado"].includes(status)) {
      return res.status(400).json({ erro: "Status inválido" });
    }
    const [pag] = await sql`
      UPDATE pagamentos SET status = ${status}
      WHERE id = ${req.params.id}
      RETURNING id, status, codigo_reserva
    `;
    if (!pag) return res.status(404).json({ erro: "Pagamento não encontrado" });
    return res.json(pag);
  } catch (err) {
    next(err);
  }
});

// ======================== CONTATOS ========================

/**
 * GET /admin/contatos — listar mensagens de contato.
 */
router.get("/contatos", async (req, res, next) => {
  try {
    const { limit, offset, paginado } = paginar(req);
    const rows = await sql`
      SELECT id, nome, email, mensagem, lido, created_at
      FROM contatos
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const [{ total }] = await sql`SELECT count(*)::int AS total FROM contatos`;
    return res.json(paginado(rows, total));
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /admin/contatos/:id/lido — marcar como lido/não lido.
 */
router.patch("/contatos/:id/lido", async (req, res, next) => {
  try {
    const { lido } = req.body;
    if (typeof lido !== "boolean") return res.status(400).json({ erro: "Campo 'lido' (boolean) é obrigatório" });
    const [contato] = await sql`
      UPDATE contatos SET lido = ${lido}
      WHERE id = ${req.params.id}
      RETURNING id, lido
    `;
    if (!contato) return res.status(404).json({ erro: "Contato não encontrado" });
    return res.json(contato);
  } catch (err) {
    next(err);
  }
});

// ======================== AVALIAÇÕES ========================

/**
 * GET /admin/avaliacoes — listar todas as avaliações.
 */
router.get("/avaliacoes", async (req, res, next) => {
  try {
    const { limit, offset, paginado } = paginar(req);
    const rows = await sql`
      SELECT a.id, a.nota, a.comentario, a.created_at,
             u.nome AS usuario_nome, u.email AS usuario_email,
             d.nome AS destino_nome
      FROM avaliacoes a
      JOIN usuarios u ON u.id = a.usuario_id
      JOIN destinos d ON d.id = a.destino_id
      ORDER BY a.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const [{ total }] = await sql`SELECT count(*)::int AS total FROM avaliacoes`;
    return res.json(paginado(rows, total));
  } catch (err) {
    next(err);
  }
});

export default router;
