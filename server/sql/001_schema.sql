-- JL Turismo — schema inicial para PostgreSQL
-- Aplicação automática: Docker monta este arquivo em docker-entrypoint-initdb.d na 1ª subida do volume.
-- Manual: psql "postgresql://postgres:postgres@localhost:5432/jlturismo" -f server/sql/001_schema.sql

CREATE TABLE IF NOT EXISTS destinos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  preco NUMERIC(12, 2) NOT NULL CHECK (preco >= 0),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  telefone TEXT,
  cep TEXT,
  rua TEXT,
  cidade TEXT,
  estado TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  destino_id UUID NOT NULL REFERENCES destinos (id) ON DELETE CASCADE,
  mensagem TEXT,
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'convertido')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interesses_usuario ON interesses (usuario_id);
CREATE INDEX IF NOT EXISTS idx_interesses_destino ON interesses (destino_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email);
