-- Tabela de pagamentos — registra transações (simuladas) de pacotes turísticos.
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  destino_id UUID REFERENCES destinos(id) ON DELETE SET NULL,
  valor NUMERIC(12, 2) NOT NULL CHECK (valor > 0),
  metodo TEXT NOT NULL CHECK (metodo IN ('cartao', 'pix', 'boleto')),
  status TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'aprovado', 'recusado', 'cancelado')),
  codigo_reserva TEXT UNIQUE NOT NULL,
  pacote_nome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pagamentos_usuario ON pagamentos (usuario_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos (status);
