-- Dados iniciais dos pacotes (alinhados ao protótipo do front)
INSERT INTO destinos (nome, descricao, preco, ativo) VALUES
  ('Praia', 'Pra fazer aquela marquinha ou virar camarão', 1000.00, true),
  ('Serrinha', 'Pra ficar vendo morro com neblina', 800.00, true),
  ('Beto Carrero - Passaporte 1 dia', 'Chamar o hugo na Star Mountain', 160.00, true),
  ('Beto Carrero - Passaporte 2 dia', 'Chamar o hugo por dois dias na Star Mountain', 240.00, true),
  ('Internacional', 'Comprinhas no Paraguai...', 5000.00, true)
;

-- Rode uma vez após o schema. Se repetir, os mesmos pacotes serão duplicados — apague a tabela destinos
-- ou use TRUNCATE destinos CASCADE; antes, se estiver estudando e quiser recomeçar.
