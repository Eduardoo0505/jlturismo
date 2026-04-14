import dotenv from "dotenv";
import postgres from "postgres";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn(
    "[db] DATABASE_URL não definida. Copie server/.env.example → server/.env e suba o Postgres: na raiz do repo, docker compose up -d"
  );
}

const url = connectionString || "postgres://127.0.0.1:5432/postgres";
const isLocal = url.includes("localhost") || url.includes("127.0.0.1");

const options = isLocal ? {} : { ssl: { rejectUnauthorized: false } };

/**
 * Cliente PostgreSQL (postgres.js), apontando para o Postgres do Docker em desenvolvimento.
 * Queries: sql`SELECT ... WHERE id = ${id}` (valores escapados automaticamente).
 */
const sql = postgres(url, options);

export default sql;
