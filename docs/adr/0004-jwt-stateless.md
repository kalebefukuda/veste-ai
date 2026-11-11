# ADR-0004 — JWT stateless em vez de sessão em banco

Data: 27/08/2026 · Status: aceita

## Contexto

A autenticação precisa identificar o usuário em cada requisição. O backend roda em
**ECS Fargate**, onde o número de tasks muda: o `desired_count` vai a zero na Fase 2 da
estratégia de custo e volta depois, e nada garante que a mesma task atenda duas
requisições do mesmo usuário.

## Alternativas consideradas

**A — Sessão em banco.** Um registro por sessão, com revogação imediata: apagou a
linha, o acesso morre. Custa uma consulta ao RDS **em toda requisição autenticada**, e
o RDS é `db.t4g.micro`.

**B — Sessão em memória.** Mais rápida, e incorreta aqui: com mais de uma task o
usuário perde a sessão ao cair noutra, e toda troca de versão do ECS derruba todo mundo.

**C — JWT assinado, sem estado no servidor.** A verificação é local, sem ida ao banco.
O custo é que o token vale até expirar — revogar exige lista de bloqueio, que traz de
volta o estado que a decisão evita.

## Decisão

**C.** Token assinado com HS256, `sub` com o id do usuário e `exp` de 24 horas por
padrão, configurável por `JWT_EXPIRATION_MINUTES`.

A expiração é **parâmetro da função**, nunca `datetime.now()` solto no meio do código —
é o que permite testar token expirado sem esperar o relógio.

## Consequências

**O que fica mais fácil**

- Nenhuma consulta ao banco para autenticar: a rota protegida só valida assinatura.
- Escalar tasks e derrubar o ambiente na Fase 2 não invalida sessão de ninguém.

**O que passa a custar caro**

- **Não há logout do lado do servidor.** Sair apaga o cookie no navegador, mas o token
  continua válido até expirar. Quem roubar um token antes disso o usa até o fim.
- **Trocar o `JWT_SECRET` desloga todo mundo de uma vez.** É o único botão de revogação
  em massa que existe hoje, e ele é grosso.
- Se em algum momento for preciso revogar sessão individual — banimento, troca de senha
  que invalida sessões antigas — vai ser necessária uma lista de bloqueio, e aí o
  estado volta. A expiração de 24h existe para limitar a janela até lá.
