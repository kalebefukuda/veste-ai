# Como rodar localmente

Duas formas. A primeira é a mais curta; a segunda é a que dispensa Docker e é a que
está exercitada no dia a dia deste projeto.

## Pré-requisitos

| | Versão | Por quê |
|---|---|---|
| Python | 3.12 | `alembic==1.19.1` não existe para versões anteriores |
| Node | 22 ou 24 | é a versão que o CI usa |
| PostgreSQL | 16 | UUID como PK e `ON DELETE CASCADE` — SQLite mentiria sobre os dois |

## Opção A — Docker Compose

```bash
docker compose up
docker compose exec api alembic upgrade head
```

O `docker-compose.yml` já traz os valores de desenvolvimento embutidos, então não
precisa de `.env`.

## Opção B — sem Docker

### 1. Banco

Dois bancos: um para desenvolvimento e um para os testes, porque a suíte roda
`alembic upgrade head` no banco que encontrar.

```bash
createuser --pwprompt vesteai        # senha: vesteai
createdb --owner=vesteai vesteai
createdb --owner=vesteai vesteai_test
```

### 2. Backend

```bash
cd backend
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt

export DATABASE_URL="postgresql+psycopg://vesteai:vesteai@localhost:5432/vesteai"
export JWT_SECRET="dev-only-secret"

alembic upgrade head
uvicorn app.main:app --reload
```

`DATABASE_URL` e `JWT_SECRET` não têm valor padrão de propósito: em produção a
aplicação precisa **falhar no boot** se o segredo não chegou, em vez de subir com um
valor de desenvolvimento. Todas as variáveis estão listadas em
[`.env.example`](https://github.com/kalebefukuda/veste-ai/blob/dev/.env.example), e o
que cada uma faz está em [[Deploy-e-infraestrutura]].

### 3. Frontend

```bash
cd frontend
npm ci
npm run dev
```

| Serviço | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000 |
| Documentação da API (OpenAPI) | http://localhost:8000/docs |
| Healthcheck | http://localhost:8000/health |

## Testes

O backend precisa do `vesteai_test` no ar — a suíte aplica as migrations nele e roda
cada teste dentro de uma transação desfeita ao final.

```bash
cd backend   && pytest --cov=app --cov-report=term-missing
cd frontend  && npm test          # npm run test:coverage para o relatório
cd scripts   && pytest            # geradores de documentação
```

Lint, exatamente como o CI roda:

```bash
cd backend   && ruff check .
cd frontend  && npm run lint
cd scripts   && ruff check .
cd infra     && terraform fmt -check -recursive && terraform validate
```

> Não rode `npm run build` com o `next dev` no ar: os dois escrevem em `.next` e o
> resultado é um erro que parece bug de aplicação.

## Documentação

As páginas desta wiki moram em `docs/wiki/` no repositório e são publicadas pelo
pipeline. Antes de abrir o PR, confira que nenhum link quebrou:

```bash
python scripts/verificar_links_wiki.py --pagina-extra ADRs
```

Ele recusa link relativo dentro de `docs/wiki/`, porque a wiki do GitHub é outro
repositório e caminho relativo não resolve lá.
