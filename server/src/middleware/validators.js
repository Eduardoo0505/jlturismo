import { z } from "zod";

// ======================== SCHEMAS ========================

export const cadastroSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(120),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100),
  cpf: z.string().length(11, "CPF deve ter 11 dígitos").regex(/^\d+$/, "CPF deve conter apenas números").optional().nullable(),
  telefone: z.string().max(20).optional().nullable(),
  cep: z.string().max(10).optional().nullable(),
  rua: z.string().max(200).optional().nullable(),
  cidade: z.string().max(100).optional().nullable(),
  estado: z.string().max(2).optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

export const interesseSchema = z.object({
  destinoId: z.string().uuid("ID do destino inválido"),
  mensagem: z.string().max(500).optional().nullable(),
});

export const pagamentoSchema = z.object({
  pacoteId: z.string().min(1, "ID do pacote é obrigatório"),
  pacoteNome: z.string().min(1, "Nome do pacote é obrigatório"),
  valor: z.number().positive("Valor deve ser positivo"),
  metodo: z.enum(["cartao", "pix", "boleto"], { message: "Método inválido" }),
});

export const destinoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(200),
  descricao: z.string().min(5, "Descrição deve ter pelo menos 5 caracteres").max(1000),
  preco: z.number().min(0, "Preço não pode ser negativo"),
  ativo: z.boolean().optional(),
});

export const contatoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(120),
  email: z.string().email("E-mail inválido"),
  mensagem: z.string().min(5, "Mensagem deve ter pelo menos 5 caracteres").max(2000),
});

export const avaliacaoSchema = z.object({
  destinoId: z.string().uuid("ID do destino inválido"),
  nota: z.number().int().min(1, "Nota mínima é 1").max(5, "Nota máxima é 5"),
  comentario: z.string().max(500).optional().nullable(),
});

export const perfilUpdateSchema = z.object({
  nome: z.string().min(2).max(120).optional(),
  telefone: z.string().max(20).optional().nullable(),
  cep: z.string().max(10).optional().nullable(),
  rua: z.string().max(200).optional().nullable(),
  cidade: z.string().max(100).optional().nullable(),
  estado: z.string().max(2).optional().nullable(),
});

export const senhaUpdateSchema = z.object({
  senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
  novaSenha: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres").max(100),
});

// ======================== MIDDLEWARE ========================

/**
 * Middleware genérico de validação. Recebe um schema Zod e valida req.body.
 * Retorna 400 com erros formatados se a validação falhar.
 */
export function validar(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const erros = result.error.issues.map((issue) => ({
        campo: issue.path.join("."),
        mensagem: issue.message,
      }));
      return res.status(400).json({ erro: "Dados inválidos", detalhes: erros });
    }
    req.body = result.data; // usa os dados já parsed/limpos
    next();
  };
}
