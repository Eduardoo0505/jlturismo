/**
 * Classe de erro customizada para respostas HTTP padronizadas.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

/**
 * Middleware global de tratamento de erros do Express.
 * Deve ser registrado DEPOIS de todas as rotas.
 */
export function errorHandler(err, _req, res, _next) {
  // Erros operacionais (esperados)
  if (err.isOperational) {
    return res.status(err.statusCode).json({ erro: err.message });
  }

  // Erro de violação de unicidade do Postgres
  if (err.code === "23505") {
    return res.status(409).json({ erro: "Registro já existe (dado duplicado)" });
  }

  // Erro de FK inválida
  if (err.code === "23503") {
    return res.status(400).json({ erro: "Referência inválida (registro relacionado não encontrado)" });
  }

  // Erro de JSON mal-formado
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "JSON inválido no corpo da requisição" });
  }

  // Erro genérico / inesperado
  console.error("[ERRO NÃO TRATADO]", err);
  return res.status(500).json({ erro: "Erro interno do servidor" });
}
