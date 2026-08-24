# VesteAí

Plataforma web de curadoria de looks com links de compra centralizados. O
**creator** monta um look, adiciona as peças com os respectivos links de compra e
publica; o **consumer** navega pelo feed, monta um carrinho com peças de vários
looks e é redirecionado para as lojas — com o clique registrado para alimentar as
métricas do creator.

TCC de Engenharia de Software — Católica SC, 8º semestre, linha Web App.

> Não é e-commerce: o VesteAí não vende produtos, não processa pagamento de
> produto e não mantém catálogo próprio. A transação acontece na loja externa.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind |
| Backend | FastAPI, SQLAlchemy 2.0, Alembic |
| Banco | PostgreSQL 16 |
| Hospedagem | Vercel (frontend) · Railway (backend e banco) |

## Estrutura

```
veste-ai/
├─ backend/     API FastAPI — routers, services, repositories, clients
├─ frontend/    aplicação Next.js
└─ docs/        RFC, ADRs e fonte da wiki
```

## Como rodar localmente

Requisitos: Docker e Docker Compose.

```bash
docker compose up
docker compose exec api alembic upgrade head
```

O `docker-compose.yml` já traz os valores de desenvolvimento. O `.env.example`
documenta as variáveis necessárias para rodar fora dos containers e para
configurar os ambientes de staging e produção.

| Serviço | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000 |
| Documentação da API | http://localhost:8000/docs |
| Healthcheck | http://localhost:8000/health |

## Testes

```bash
docker compose exec api pytest --cov=app --cov-report=term-missing
```

Metas de cobertura: **75% no backend** e **25% no frontend**.

## Documentação

A documentação do sistema fica em [`docs/`](docs/) e é publicada na
[Wiki do repositório](https://github.com/kalebefukuda/veste-ai/wiki) pelo pipeline.
A RFC está em [`docs/RFC.md`](docs/RFC.md).

## Contribuindo

Ver [CONTRIBUTING.md](CONTRIBUTING.md).

## Licença

[MIT](LICENSE).
