-- Tabela de avaliações — permite que usuários avaliem destinos (estrelas + comentário).
CREATE TABLE IF NOT EXISTS avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  destino_id UUID NOT NULL REFERENCES destinos(id) ON DELETE CASCADE,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, destino_id)  -- um usuário só avalia cada destino uma vez
);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_destino ON avaliacoes (destino_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_usuario ON avaliacoes (usuario_id);
