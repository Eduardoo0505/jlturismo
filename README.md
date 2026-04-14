# JL Turismo

Site da agência (**React + Vite**) e **BFF** em Node.js (**Express**) com **PostgreSQL rodando em Docker** (única forma de banco prevista no repositório). Este README explica como rodar tudo e um **guia em etapas** para quem está aprendendo.

---

## PostgreSQL com Docker

Na **raiz** do repositório (pasta `jlturismo/`):

```bash
docker compose up -d
```

- **Primeira execução:** o Postgres cria o volume e executa, em ordem, os scripts em `server/sql/` montados no container (`001_schema.sql`, `002_seed_destinos.sql`, `003_seed_admin.sql` — tabelas, pacotes de exemplo e usuário admin de desenvolvimento).
- **Usuário / senha / banco:** `postgres` / `postgres` / `jlturismo` (definidos em `docker-compose.yml` — só para desenvolvimento).

Conferir se subiu:

```bash
docker compose ps
```

**Recomeçar do zero** (apaga dados locais):

```bash
docker compose down -v
docker compose up -d
```

O init do Postgres volta a criar schema, destinos e admin automaticamente.

Se atualizaste o repositório e **já tinhas** um volume Docker antigo **sem** o arquivo `003_seed_admin.sql`, o admin pode não existir: usa `docker compose down -v` uma vez para recriar o volume com todos os scripts atuais.

Se a porta **5432** já estiver ocupada por outro Postgres no Mac, altere em `docker-compose.yml` para `"5433:5432"` e use `localhost:5433` na `DATABASE_URL` do `server/.env`.

---

## Rodar o front-end

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`. Opcional: copie `.env.example` para `.env` na raiz do front e defina `VITE_API_URL` se o BFF não estiver em `http://localhost:3000`.

---

## Rodar o BFF (backend)

```bash
cd server
npm install
cp .env.example .env
# Ajuste JWT_SECRET. DATABASE_URL já aponta para o Postgres do Docker.
npm run dev
```

| URL | Uso |
|-----|-----|
| `http://localhost:3000` | Base da API |
| `http://localhost:3000/health` | Verifica se o servidor está no ar |
| `http://localhost:3000/api-docs` | **Swagger** |

**Admin de testes** (criado pelo Docker na 1ª subida): e-mail `admin@jlturismo.local`, senha `admin123` (definidos em `server/sql/003_seed_admin.sql` — só para desenvolvimento).

O arquivo `server/.env` **não** deve ser commitado. A `DATABASE_URL` deve apontar para o container (`localhost` e a porta mapeada no `docker-compose.yml`).

---

## Glossário rápido

- **API**: contrato HTTP (URLs + JSON) entre front e back.
- **BFF** (*Backend for Frontend*): camada que adapta dados do banco ao que as telas precisam.
- **JWT**: token assinado pelo servidor que identifica o usuário logado.
- **MER**: modelo entidade-relacionamento (tabelas e relacionamentos no banco).

---

## Guia para estudantes (etapas 1 a 5)

### Etapa 1 — Ambiente e o que é um BFF

**Por que um “back” separado do React?** O React roda no navegador; não colocamos no front senhas de banco nem chaves secretas. O **backend** valida dados, fala com o banco e devolve só o necessário.

**O que é BFF?** Uma API pensada nas telas: cadastro, login, destinos, interesse, admin. O projeto Node fica em `server/`.

**Estrutura da pasta `server/`**

```
server/
├── .env.example
├── sql/              # schema + seeds (Docker roda na 1ª subida do volume)
├── src/
│   ├── config/       # db.js — cliente postgres (postgres.js)
│   ├── middleware/
│   ├── routes/
│   ├── openapi.yaml
│   └── index.js
└── package.json
```

**Variáveis (`server/.env`)**

- `DATABASE_URL`: Postgres do **Docker** (`localhost`, porta do compose).
- `JWT_SECRET`: assinatura dos JWT.
- `PORT`, `CORS_ORIGIN`: API e CORS para o Vite.

**Comandos no `server/`**

```bash
npm install
npm run dev
```

---

### Etapa 2 — Banco de dados (Docker + MER)

**Docker** sobe um container **PostgreSQL** isolado: mesma versão de SQL em qualquer máquina com Docker instalado. Os arquivos em `server/sql/` são montados em `/docker-entrypoint-initdb.d/` e rodam **só na primeira criação** do volume.

**MER em tabelas**

| Tabela | Papel |
|--------|--------|
| `destinos` | Catálogo (nome, descrição, preço, ativo). |
| `usuarios` | Cadastro: e-mail, hash da senha, dados, papel `user` ou `admin`. |
| `interesses` | Liga um usuário a um destino. |

**Conexão no Node** (`server/src/config/db.js`): biblioteca **`postgres`**, conectando ao host/porta do `docker-compose.yml` (em `localhost` não usamos SSL).

---

### Etapa 3 — Autenticação: hash de senha e JWT

**Senha:** bcrypt grava só o hash em `usuarios.senha_hash`. **JWT:** payload com `sub`, `email`, `role`; o front envia `Authorization: Bearer <token>`.

**Rotas:** públicas (`/destinos`, `/login`, `/cadastro`); privadas (`/interesses`); admin (`/admin/*`).

---

### Etapa 4 — Destinos e interesses (React)

**`GET /destinos`** é pública. Fluxo: escolher pacote → `localStorage` → login → `POST /interesses` com JWT. Os dados ficam no **Postgres do Docker**.

---

### Etapa 5 — Admin, Swagger e próximos passos

**Swagger:** `http://localhost:3000/api-docs`.

**Evoluir:** testes (Jest + Supertest), validação (Zod), deploy do BFF e `VITE_API_URL` no front.

---

## Sobre o repositório

Projeto baseado no template **React + Vite**; BFF com **postgres.js** e Postgres **somente** via **Docker**.

Dúvidas em grupo: anotem a **etapa** e a **seção** deste README.
