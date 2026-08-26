# Como contribuir

Obrigado pelo interesse. Este documento descreve o fluxo de trabalho, as
convenções e o que é verificado antes de um Pull Request ser aceito.

## Ambiente

```bash
docker compose up
docker compose exec api alembic upgrade head
```

O ambiente completo (frontend, API e banco) sobe em containers. Não é necessário
instalar Python ou Node na máquina.

## Fluxo de branches

```
feat/nome-da-feature ──PR──▶ dev ──PR de release──▶ main
                             (staging)              (produção)
```

- `dev` é o ambiente de staging, `main` é produção. **Nunca commite direto em
  nenhuma das duas** — as duas são protegidas e exigem PR.
- Prefixos: `feat/`, `fix/`, `chore/`, `refactor/`, `docs/`, `test/`.

## Commits

Conventional Commits com **escopo obrigatório**, em inglês, no imperativo,
minúsculo depois do `:` e sem ponto final.

Escopos: `api` · `web` · `db` · `ci` · `wiki` · `docs` · `infra`.

Única exceção: mudança em arquivo de raiz — `README.md`, `LICENSE`, `CLAUDE.md`,
`CONTRIBUTING.md` — vai sem escopo, porque nenhum da lista descreve onde ela mexe.

```
feat(api): add login endpoint issuing a jwt
test(api): cover token expiration and invalid credentials
feat(web): add login screen with form validation
chore(ci): add frontend coverage job
```

### Um commit pertence a um lado

**Nenhum commit toca `backend/` e `frontend/` ao mesmo tempo.** Isso mantém
`git log -- backend/` legível e faz `git blame` sempre apontar para uma única
camada. Na prática, nunca use `git add .`:

```bash
git add backend/  && git commit -m "feat(api): add login endpoint issuing a jwt"
git add frontend/ && git commit -m "feat(web): add login screen consuming /auth/login"
```

Se um commit misturou os dois lados:

```bash
git reset --soft HEAD~1
git add backend/  && git commit -m "feat(api): ..."
git add frontend/ && git commit -m "feat(web): ..."
```

O **Pull Request** contém as duas pontas, para que a feature seja revisada e
testada de ponta a ponta. São os commits dentro dele que ficam separados.

## Testes

Todo código de negócio nasce de um teste que falha primeiro (TDD).

```bash
docker compose exec api pytest --cov=app --cov-report=term-missing
```

Cada regra de negócio tem ao menos um teste que **cita a regra no nome**, para que
a rastreabilidade entre requisito e teste seja verificável com um `pytest -k`:

```python
def test_rn04_nao_publica_look_sem_peca_com_link(): ...
def test_rn07_edicao_de_look_de_outro_usuario_retorna_403(): ...
```

Metas de cobertura: **75% no backend**, **25% no frontend**.

## Estilo

- **Python:** `ruff check .` e `ruff format .` limpos. Type hint em toda função
  pública. Pydantic na entrada e na saída da API.
- **TypeScript:** `strict`, sem `any` e sem `@ts-ignore`.
- Nomes de domínio em inglês (`look`, `piece`, `click`); mensagens ao usuário em
  português.

## Arquitetura — o que não pode vazar

```
HTTP → router → service → repository → banco
                   ↓
                client (Gemini, Stripe, S3)
```

- `routers` não acessam banco nem contêm regra de negócio.
- `services` não conhecem HTTP e não importam `fastapi`.
- `repositories` não decidem nada.
- `clients` convertem falha externa em exceção de domínio.
- `app/config.py` é o único lugar que lê variável de ambiente.

## Antes de abrir o PR

- [ ] Teste escrito antes da implementação e passando
- [ ] Regra de negócio coberta, não só o caminho feliz
- [ ] Lint limpo nos dois lados
- [ ] Nenhum segredo no diff
- [ ] Documentação afetada atualizada no mesmo PR
- [ ] Nenhum commit misturando `backend/` e `frontend/`
- [ ] Estados de carregando, erro, vazio e sucesso cobertos, se mexeu em UI

## Issues

Ao relatar um bug, inclua passos para reproduzir, comportamento esperado,
comportamento observado e evidência (print ou log).

## Decisões

Decisão que fecha uma porta — trocar tecnologia, aceitar uma redundância no modelo
de dados, mudar estratégia de paginação — vira um ADR em `docs/adr/`.
