# JL Turismo

Site da agência (**React + Vite**) e **BFF** em Node.js (**Express**) com **PostgreSQL rodando em Docker** (única forma de banco prevista no repositório). Este README explica como rodar tudo e um **guia em etapas** para quem está aprendendo.

---

## Como Rodar a Aplicação

Este projeto suporta duas formas de execução: **Docker Compose Unificado** (método recomendado, que constrói e roda banco, API e frontend juntos) ou **Desenvolvimento Local** (onde apenas o banco roda no Docker).

---

### Método 1: Docker Compose Unificado (Recomendado)

Ideal para rodar a aplicação completa com um único comando. Na **raiz** do repositório:

```bash
# 1. Iniciar e buildar todos os serviços (Banco + API + Frontend)
docker compose up --build -d
```

- **Como funciona:** O Compose sobe automaticamente:
  1. O banco PostgreSQL (`db`), aplicando todas as migrations (`001` a `006`) e semeando os pacotes e o usuário administrador.
  2. O backend/API (`api`), conectando-se internamente ao container do banco.
  3. O frontend React (`web`), servido por um servidor Nginx leve otimizado para SPA.
- **Portas expostas no host:**
  - **Frontend (Nginx + React):** [http://localhost:5173](http://localhost:5173)
  - **Backend (Express):** [http://localhost:3000](http://localhost:3000) (Health check: `/health`)
  - **Documentação (Swagger):** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

**Recomeçar do zero (Limpar banco e recriar tabelas):**
```bash
docker compose down -v
docker compose up --build -d
```

---

### Método 2: Desenvolvimento Local (Alternativo)

Ideal se você deseja fazer alterações de código com *hot-reload* imediato no frontend ou no backend sem precisar reconstruir imagens do Docker.

#### 1. Subir apenas o Banco de Dados (Docker)
Na raiz do repositório, rode apenas o serviço de banco:
```bash
docker compose up -d db
```

#### 2. Rodar o Backend (API)
Abra um terminal, vá para a pasta `server/` e execute:
```bash
cd server
npm install
cp .env.example .env    # se ainda não existir
npm run dev             # Roda com nodemon
```
*Ajuste as variáveis no `server/.env` se necessário. Por padrão, ele conecta no Postgres do localhost:5432.*

#### 3. Rodar o Frontend (React)
Abra outro terminal na raiz do projeto e execute:
```bash
npm install
npm run dev             # Roda o servidor de desenvolvimento do Vite
```
Acesse [http://localhost:5173](http://localhost:5173).

---

### Credenciais de Testes (Criadas por Padrão)
* **Administrador:** `admin@jlturismo.local` / senha `admin123`
* **Clientes comuns:** `cliente1@jlturismo.local` / senha `cliente123`


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
