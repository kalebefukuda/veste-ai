# ADR-0011b — JWT em cookie `httpOnly` atrás do proxy do Next

Data: 27/08/2026 · Status: aceita

## Contexto

O token precisa sair do backend e voltar em cada requisição autenticada. Frontend e API
vivem em **origens diferentes** — Vercel de um lado, domínio do ALB do outro — então o
transporte escolhido decide três coisas de uma vez: se há CORS a configurar, se um XSS
consegue roubar a sessão, e se o token aparece em `localStorage` para qualquer script
da página ler.

## Alternativas consideradas

**A — Token no `localStorage`, enviado em header `Authorization`.** É o caminho mais
comum e o mais fácil de escrever. Também é o pior sob XSS: qualquer script injetado lê
`localStorage` e leva a sessão inteira. Exige CORS explícito entre as duas origens.

**B — Cookie `httpOnly` direto do backend para o navegador.** Protege contra XSS, mas
entre origens diferentes exige `SameSite=None; Secure`, que reabre a superfície de CSRF
e depende de o navegador aceitar cookie de terceiros — cada vez mais restrito.

**C — Route Handler do Next como proxy.** O navegador fala **só** com o domínio da
Vercel; o handler no servidor chama a API e grava o token num cookie `httpOnly` de
primeira parte.

## Decisão

**C.** `POST /api/auth/login` e `/api/auth/register` são handlers do Next. Eles chamam
a API, recebem o token e gravam `vesteai_session` com `httpOnly`, `sameSite=lax`, e
`secure` em produção.

O `lib/api.ts` do cliente conversa apenas com essas rotas do próprio Next. Nenhum
código de navegador toca o token.

## Consequências

**O que fica mais fácil**

- **XSS deixa de dar acesso à sessão.** `document.cookie` não enxerga cookie `httpOnly`,
  então script injetado não consegue ler o token. Verificado no navegador: vem vazio.
- **CORS deixa de ser problema de arquitetura.** O navegador só fala com uma origem, e
  a chamada entre Next e API é servidor a servidor.
- `SameSite=Lax` cobre CSRF nas requisições que importam, sem depender de cookie de
  terceiros.

**O que passa a custar caro**

- **Toda rota autenticada precisa de um handler correspondente no Next.** É código a
  mais para cada endpoint, e um lugar a mais onde esquecer de repassar algo.
- **Um salto de rede a mais** em cada requisição autenticada: navegador → Vercel → API.
  Some latência, e coloca a Vercel no caminho crítico de chamadas que antes iriam
  direto.
- **O `AFTER_AUTH` ainda aponta para a landing** porque a área logada não existe. Quando
  existir, é onde a sessão passa a ser lida no servidor.
- Aplicativo móvel, se um dia existir, não usa cookie do mesmo jeito e precisaria do
  header `Authorization` — que o backend continua aceitando.
