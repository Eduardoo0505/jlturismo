/**
 * Helper de paginação para rotas de listagem.
 * Extrai page/limit da query string e retorna offset + função de resposta paginada.
 *
 * Uso:
 *   const { limit, offset, paginado } = paginar(req);
 *   const rows = await sql`SELECT ... LIMIT ${limit} OFFSET ${offset}`;
 *   const [{ total }] = await sql`SELECT count(*)::int AS total FROM ...`;
 *   return res.json(paginado(rows, total));
 */
export function paginar(req) {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const offset = (page - 1) * limit;

  function paginado(dados, totalItems) {
    return {
      dados,
      paginacao: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  return { page, limit, offset, paginado };
}
