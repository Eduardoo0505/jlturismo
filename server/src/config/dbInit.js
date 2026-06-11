import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sql from "./db.js";
import logger from "./logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlDir = path.join(__dirname, "..", "..", "sql");

/**
 * Executa as migrações e sementes (seeds) automaticamente na inicialização da API,
 * garantindo tabelas e dados consistentes mesmo que o volume do banco já existisse.
 */
export async function inicializarBanco() {
  logger.info("[db] Verificando e executando migrações/seeds do banco de dados...");
  try {
    // 1. Criar tabelas básicas do schema
    const schemaSql = fs.readFileSync(path.join(sqlDir, "001_schema.sql"), "utf8");
    await sql.unsafe(schemaSql);

    // 2. Criar novas tabelas de recursos
    const pagamentosSql = fs.readFileSync(path.join(sqlDir, "004_pagamentos.sql"), "utf8");
    await sql.unsafe(pagamentosSql);

    const contatosSql = fs.readFileSync(path.join(sqlDir, "005_contatos.sql"), "utf8");
    await sql.unsafe(contatosSql);

    const avaliacoesSql = fs.readFileSync(path.join(sqlDir, "006_avaliacoes.sql"), "utf8");
    await sql.unsafe(avaliacoesSql);

    // 3. Alimentar destinos padrão se a tabela estiver vazia
    const [{ count }] = await sql`SELECT count(*)::int FROM destinos`;
    if (count === 0) {
      logger.info("[db] Tabela de destinos vazia. Semeando destinos padrão...");
      const destinosSql = fs.readFileSync(path.join(sqlDir, "002_seed_destinos.sql"), "utf8");
      await sql.unsafe(destinosSql);
    } else {
      logger.info(`[db] Tabela destinos já possui ${count} registros.`);
    }

    // 4. Garantir que o usuário admin exista
    const adminSql = fs.readFileSync(path.join(sqlDir, "003_seed_admin.sql"), "utf8");
    await sql.unsafe(adminSql);

    logger.info("[db] Inicialização do banco de dados concluída!");
  } catch (error) {
    logger.error("[db] Erro ao inicializar tabelas/dados no banco:", error.message);
  }
}
