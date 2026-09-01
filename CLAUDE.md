# VesteAí — contexto do projeto

Plataforma web de curadoria de looks com links de compra centralizados.
TCC de Engenharia de Software, Católica SC, 8º semestre — linha Web App.
Autor: Kalebe Fukuda de Oliveira. Entrega: 30/11/2026.

> Arquivo curto de propósito: ele carrega em toda sessão. O que dá para descobrir
> lendo dois arquivos do repositório não entra aqui.

## Como trabalhar neste repositório

1. **Pensar antes de codar.** Enunciar suposições. Havendo mais de uma leitura
   razoável do pedido, apresentar as duas em vez de escolher em silêncio.
2. **Simplicidade primeiro.** O mínimo de código que resolve. Sem feature
   especulativa, sem abstração para código de uso único.
3. **Mudanças cirúrgicas.** Tocar só o que o pedido exige, casando com o estilo
   existente. Não reformatar nem "melhorar" código vizinho.
4. **Objetivo verificável.** "Corrigir o bug" vira "escrever o teste que reproduz,
   depois fazer passar". Passo sem verificação executável está vago demais.
5. **Delegar quando o trabalho é genuinamente paralelo** — as condições em que isso
   é seguro estão nas notas *Ondas Paralelas* e *Revisão Multi-Agente* do vault.

## Regras não negociáveis

1. **TDD.** Teste escrito antes da implementação. Metas de cobertura: backend ≥75%,
   frontend ≥25% — são gate de aprovação da disciplina, conferidas na prova de autoria.
2. **Toda regra de negócio (RN01–RN09) tem teste com o código da regra no nome.**
   Ex.: `test_rn04_nao_publica_look_sem_peca_com_link`.
3. **Nenhum segredo em código.** Só variável de ambiente. `.env` nunca é commitado.
4. **Deploy só pelo pipeline.** O auto-deploy da Vercel fica desligado; o backend só
   troca de versão quando o GitHub Actions empurra a imagem pro ECR e pede novo
   deployment ao ECS. Auto-deploy não conta como CI/CD.
5. **Documentação do sistema mora em `docs/`** — é a fonte. A publicação automática
   na wiki do GitHub **ainda não existe**; quando existir, a wiki passa a ser gerada e
   editá-la pela interface deixa de fazer sentido.
6. **Decisão que fecha uma porta gera ADR** em `docs/adr/`.
7. **Toda mudança entra por PR:** branch de trabalho → `dev` → `main`. `dev` é
   staging, `main` é produção. Nunca commitar direto em nenhuma das duas.

## Stack

Python 3.12 · FastAPI + SQLAlchemy 2.0 + Alembic · pip
TypeScript · Next.js 14 (App Router) + React 18 + Tailwind · npm
PostgreSQL 16 · Docker Compose no ambiente local

## Comandos canônicos

Usar exatamente estes — não adivinhar variação.

| | Backend (`backend/`) | Frontend (`frontend/`) |
|---|---|---|
| **Install** | `pip install -r requirements-dev.txt` | `npm ci` |
| **Lint** | `ruff check .` | `npm run lint` |
| **Typecheck** | não existe | não existe como script — roda dentro do `npm run build` |
| **Test** | `pytest --cov=app --cov-report=term-missing` — exige Postgres no ar | `npm test` · `npm run test:coverage` |
| **Build** | `docker build -t vesteai-api .` | `npm run build` |
| **Run/Dev** | `docker compose up` (api :8000 · web :3000 · postgres :5432) | |

Migrations: `docker compose exec api alembic upgrade head`.

O CI roda o mesmo comando de teste acrescido de `--cov-fail-under`. O limiar vive só em
`.github/workflows/ci.yml`, para não precisar subir em dois arquivos a cada sprint.

## Arquitetura

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind. SSR nas rotas públicas
  (feed, detalhe do look), client-side no editor e no painel.
- **Backend:** FastAPI + SQLAlchemy 2.0 + Alembic. Camadas:
  `routers` → `services` → `repositories`, com `clients` isolando o externo.
- **Banco:** PostgreSQL. 6 tabelas: users, looks, pieces, clicks, saved_looks e
  password_resets. UUID como PK, `ON DELETE CASCADE`.
- **Externos:** Google Gemini (geração de imagem), Stripe (assinatura Pro do creator
  — nunca pagamento de produto), AWS S3 (imagens), lojas de e-commerce (só
  redirecionamento, sem API).
- **Hospedagem:** Vercel (frontend). Backend em AWS ECS Fargate (`sa-east-1`), atrás
  de ALB com certificado ACM. Banco em AWS RDS PostgreSQL (`db.t4g.micro`, sub-rede
  privada). Imagens em S3, bucket privado com URL pré-assinada. Segredos no AWS
  Secrets Manager, referenciados no campo `secrets` da task definition — nunca em
  `environment`.
- **Infraestrutura:** Terraform em `infra/` — **ainda não existe no repositório**. O
  desenho é que mudança de infra seja mudança de código: entra por PR, com
  `terraform plan` no pipeline. `terraform apply` é sempre manual e com aval, porque
  cria recurso que cobra.

## Fronteiras de camada — não violar

- `routers` não acessam banco nem contêm regra de negócio. Só entrada/saída.
- `services` não conhecem HTTP. Não recebem `Request`, não devolvem `Response`.
- `repositories` só falam SQL/ORM. Nenhuma decisão de negócio.
- `clients` encapsulam Gemini, Stripe e S3. Erro externo vira sempre exceção de
  domínio, nunca exceção da biblioteca vazando para cima.
- O frontend **nunca** fala com Gemini, Stripe ou S3 direto.

## Regras de negócio (resumo — detalhe na RFC §2.5)

- RN01 Só autenticado cria/edita/remove look.
- RN02 Só autenticado salva favorito.
- RN03 Feed e links de compra são públicos, sem autenticação.
- RN04 Look só publica com ao menos uma peça com link de compra.
- RN05 Peça exige nome e link de compra.
- RN06 A validade comercial do link é responsabilidade do creator.
- RN07 Creator só edita/remove looks próprios → 403.
- RN08 Clique só conta quando há redirecionamento efetivo.
- RN09 Métricas de clique visíveis só para o creator do look → 403.
- Extra: imagem é obrigatória para publicar (upload ou Gemini).

## Fora de escopo — não implementar

Pagamento de produto · integração com programas de afiliado · chat entre usuários ·
venda direta na plataforma · curadoria/moderação automática.

## Convenções

- **Commits:** Conventional Commits, em inglês, imperativo, minúsculo após o `:`, sem
  ponto final. **Escopo obrigatório** — `api`, `web`, `db`, `ci`, `wiki`, `docs`,
  `infra` — exceto em mudança de arquivo de raiz (`README`, `LICENSE`, `CLAUDE.md`),
  onde nenhum escopo da lista se aplica. Sem menção de stack entre parênteses.
  Detalhe em `CONTRIBUTING.md`.
- **Nenhum commit toca `backend/` e `frontend/` ao mesmo tempo.** Um commit pertence a
  um lado. Nunca `git add .`; sempre `git add backend/` ou `git add frontend/`.
- **Nunca** incluir `Co-Authored-By`, link de sessão ou "Generated with" em commit ou PR.
- **Comentário só quando o código não se explica, e no máximo uma linha.** Bloco de comentário explicando decisão é ruído: o porquê mora no PR, no ADR ou no vault.
- Python: `ruff` + type hints em tudo. Pydantic para entrada e saída.
- TypeScript: `strict`. Sem `any`. Sem `console.log` em código de produção.
- Nomes de domínio em inglês (look, piece, click); mensagens de usuário em português.
- Toda operação assíncrona no frontend tem estado de carregamento, de erro e de
  sucesso visível. Ausência de feedback é item penalizado na avaliação.

## Acessibilidade (RNF13/RNF14)

Contraste ≥ 4,5:1 em texto, navegação completa por teclado com foco visível, `alt` em
toda imagem de look e peça, HTML semântico, `label` associado em todo campo. Atenção:
o roxo `#8B5CF6` sobre branco tem 4,23:1 — reprova em texto normal, que exige 4,5:1.
Serve em texto grande (≥24px, ou 19px bold) e em botão preenchido com texto branco.

## O que perguntar antes de assumir

Se uma tarefa exigir mudar arquitetura, stack, escopo ou uma regra de negócio: pare e
pergunte. Essas decisões estão registradas na RFC aprovada e mudá-las tem consequência
acadêmica, não só técnica.
