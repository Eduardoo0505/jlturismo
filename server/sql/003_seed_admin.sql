-- Usuário admin só para desenvolvimento (login no Swagger / testes).
-- E-mail: admin@jlturismo.local  |  Senha: admin123
-- Hash gerado com bcrypt (10 rounds), compatível com bcryptjs no BFF.
INSERT INTO usuarios (nome, email, senha_hash, role)
VALUES (
  'Administrador',
  'admin@jlturismo.local',
  '$2b$10$/HjXgKyN3fD0WGvxPP/aTue3IGGXOgMDN3gXzk.l.WxR74QxLItUa',
  'admin'
)
ON CONFLICT (email) DO NOTHING;
