// server/src/routes/usuarios.routes.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import sql from "../config/db.js";
import { authRequired } from "../middleware/auth.js";
import { validar, perfilUpdateSchema, senhaUpdateSchema } from "../middleware/validators.js";

const router = Router();

// Todas as rotas exigem login
router.use(authRequired);

/**
 * GET /perfil — dados do usuário logado.
 */
router.get("/perfil", async (req, res, next) => {
  try {
    const [user] = await sql`
      SELECT id, nome, email, cpf, telefone, cep, rua, cidade, estado, role, created_at
      FROM usuarios
      WHERE id = ${req.user.id}
    `;
    if (!user) return res.status(404).json({ erro: "Usuário não encontrado" });
    return res.json(user);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /perfil — atualizar dados do perfil.
 */
router.put("/perfil", validar(perfilUpdateSchema), async (req, res, next) => {
  try {
    const { nome, telefone, cep, rua, cidade, estado } = req.body;

    const [updated] = await sql`
      UPDATE usuarios
      SET
        nome     = COALESCE(${nome}, nome),
        telefone = COALESCE(${telefone}, telefone),
        cep      = COALESCE(${cep}, cep),
        rua      = COALESCE(${rua}, rua),
        cidade   = COALESCE(${cidade}, cidade),
        estado   = COALESCE(${estado}, estado)
      WHERE id = ${req.user.id}
      RETURNING id, nome, email, cpf, telefone, cep, rua, cidade, estado, role
    `;

    return res.json(updated);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /perfil/senha — alterar senha (exige senha atual).
 */
router.put("/perfil/senha", validar(senhaUpdateSchema), async (req, res, next) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    const [user] = await sql`SELECT senha_hash FROM usuarios WHERE id = ${req.user.id}`;
    if (!user) return res.status(404).json({ erro: "Usuário não encontrado" });

    const ok = await bcrypt.compare(senhaAtual, user.senha_hash);
    if (!ok) return res.status(401).json({ erro: "Senha atual incorreta" });

    const novoHash = await bcrypt.hash(novaSenha, 10);
    await sql`UPDATE usuarios SET senha_hash = ${novoHash} WHERE id = ${req.user.id}`;

    return res.json({ mensagem: "Senha alterada com sucesso" });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /perfil/interesses — interesses do usuário logado.
 */
router.get("/perfil/interesses", async (req, res, next) => {
  try {
    const rows = await sql`
      SELECT i.id, i.status, i.mensagem, i.created_at,
             d.nome AS destino_nome, d.preco AS destino_preco
      FROM interesses i
      JOIN destinos d ON d.id = i.destino_id
      WHERE i.usuario_id = ${req.user.id}
      ORDER BY i.created_at DESC
    `;
    return res.json(rows);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /perfil/pagamentos — pagamentos do usuário logado.
 */
router.get("/perfil/pagamentos", async (req, res, next) => {
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

export default router;
