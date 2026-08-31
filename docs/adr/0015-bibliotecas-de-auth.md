# ADR-0015 — `bcrypt` direto e PyJWT, sem camadas intermediárias

Data: 27/08/2026 · Status: aceita

## Contexto

Hash de senha e assinatura de token são as duas peças onde um erro não aparece em teste
funcional — a senha continua "funcionando" com hash fraco, e o token continua
"validando" com algoritmo errado. A escolha da biblioteca é decisão de segurança, não
de conveniência.

## Alternativas consideradas

**A — `passlib` para o hash.** É a escolha tradicional em tutoriais de FastAPI e traz
troca de algoritmo por configuração. Adiciona uma camada de abstração sobre o `bcrypt`
para um projeto que usa **um** algoritmo, e teve incompatibilidade conhecida com
versões recentes do `bcrypt`.

**B — `python-jose` para o JWT.** Suporta JWE e um conjunto amplo de algoritmos que
este projeto não usa. Manutenção mais lenta que a alternativa.

**C — `bcrypt` e `PyJWT` diretos.** Menos superfície: cada uma faz uma coisa, sem
camada de tradução entre a aplicação e a primitiva.

## Decisão

**C.** `bcrypt==5.0.0` para hash e verificação de senha, `pyjwt==2.13.0` para assinar
e validar o token. Ambas com versão fixa, e o hash conferido em teste — a asserção
verifica que o valor gravado começa com `$2b$` e que a senha em texto claro não aparece.

## Consequências

**O que fica mais fácil**

- Uma dependência a menos entre o código e a primitiva de segurança, o que torna a
  revisão do PR uma leitura direta em vez de confiança na camada.
- `bcrypt` gera o salt sozinho a cada chamada, então não há salt para o projeto
  gerenciar nem errar.

**O que passa a custar caro**

- **Trocar de algoritmo deixa de ser configuração e vira código.** Se o projeto um dia
  precisar de Argon2, é reescrever `core/security.py` e migrar os hashes existentes.
  Aceitável: essa troca não está prevista, e adiar não a torna mais cara.
- O algoritmo do JWT fica fixado no código (`HS256`). Isso é proposital — algoritmo
  vindo do próprio token é a origem do ataque de `alg: none`.
