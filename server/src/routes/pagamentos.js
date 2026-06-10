// server/src/routes/pagamentos.js
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// POST /api/pagamentos
router.post('/', async (req, res) => {
  try {
    const { pacoteId, pacoteNome, valor, metodo } = req.body;

    if (!pacoteId || !valor || !metodo) {
      return res.status(400).json({ erro: 'Dados incompletos' });
    }

    // Simula processamento
    await new Promise((r) => setTimeout(r, 1500));

    // Gera "confirmação" simulada
    const confirmacao = {
      id:             uuidv4(),
      status:         'aprovado',
      pacoteId,
      pacoteNome,
      valor,
      metodo,
      dataHora:       new Date().toISOString(),
      codigoReserva:  `JL-${Date.now()}`,
    };

    // (Opcional) Salvar no banco de dados:
    // await sql`
    //   INSERT INTO pagamentos (id, usuario_id, pacote_id, valor, metodo, status)
    //   VALUES (${confirmacao.id}, ${req.usuario.sub}, ${pacoteId}, ${valor}, ${metodo}, 'aprovado')
    // `;

    return res.status(201).json(confirmacao);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro interno' });
  }
});

export default router;