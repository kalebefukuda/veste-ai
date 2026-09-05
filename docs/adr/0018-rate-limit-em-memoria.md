# ADR-0018 — Rate limit com contador em memória, sem Redis

Data: 05/09/2026 · Status: aceita

## Contexto

As quatro rotas de `/auth/*` estavam sem freio. A tabela OWASP do projeto lista
*"rate limit em `/auth/*`"* como mitigação de **Auth Failures**, e ela não existia — a
documentação afirmava uma proteção que o código não tinha.

Duas consequências concretas, não teóricas: força bruta de senha sem custo para o
atacante, e `forgot-password` em laço queimando a cota de **300 e-mails/dia** do plano
gratuito da Brevo em minutos, deixando usuários reais sem recuperação de conta.

Contar requisições exige guardar o contador em algum lugar, e é só isso que está em
jogo aqui: **onde o contador mora**.

## Alternativas

**A — Em memória do processo.** Um dicionário na RAM do processo Python. Sem rede, sem
serviço externo, custo zero.

**B — Redis (ElastiCache).** Contador num serviço separado, compartilhado entre
processos e sobrevivendo a restart da aplicação.

## Decisão

**A.** E a razão é a topologia, não a preguiça:

```
backend/Dockerfile   CMD uvicorn app.main:app ...   ← sem --workers, logo 1 processo
infra/ecs.tf         desired_count = 1              ← 1 tarefa
```

Com **um processo e uma tarefa** existe exatamente um contador, e ele vê 100% do
tráfego. O benefício do Redis — contador compartilhado — não se materializa, porque não
há nada para compartilhar.

Do outro lado, o Redis custa ~US$ 12–15/mês contra um crédito AWS finito de US$ 120,
subindo a queima de ~US$ 57 para ~US$ 70/mês. E acrescenta um componente que pode cair,
o que obrigaria a escolher entre *fail open* (sem limite algum) e *fail closed* (recusar
todo mundo) — as duas ruins.

Limites escolhidos, calibrados pelo que cada rota gasta:

| Rota | Limite | Por quê |
|---|---|---|
| `/auth/login` | 10/min | força bruta; gasta CPU |
| `/auth/reset-password` | 10/min | adivinhação de token |
| `/auth/register` | 10/hora | criação de contas em massa |
| `/auth/forgot-password` | **3/hora** | o mais apertado: gasta cota de e-mail, que é finita e diária |

## Consequências

+ Custo zero e nenhuma peça nova de infraestrutura.
+ Reverter é barato **de propósito**: o armazenamento entra por URI
  (`rate_limit_storage`), então trocar para Redis é `memory://` → `redis://host:6379`,
  uma variável de ambiente. A porta fechada tem maçaneta dos dois lados.
− O contador zera a cada restart. Aceitável: o atacante não provoca restart, e a janela
  protegida é de minutos.

> [!danger] O acoplamento invisível que este ADR existe para registrar
> A decisão depende de dois números que vivem em **outros arquivos**. Mudar qualquer um
> deles enfraquece a proteção **em silêncio** — nenhum teste falha, nenhum alerta toca,
> o deploy passa verde:
>
> - `--workers 4` no `Dockerfile` → limite efetivo **4x**
> - `desired_count = 2` no `ecs.tf` → limite efetivo **2x**
>
> Qualquer um dos dois reabre este ADR.

### O furo encontrado ao implementar

A primeira versão lia o **primeiro** item do `X-Forwarded-For`. O ALB **acrescenta** o
IP observado ao cabeçalho que já veio, em vez de substituir — então o primeiro item é
escrito pelo cliente. Um atacante trocaria o valor a cada requisição e teria um balde
novo toda vez: o freio existiria e não freiaria nada.

Corrigido para ler o **último** item, que é o único que o ALB escreveu. Está coberto por
`test_nao_confia_no_ip_que_o_proprio_cliente_alega`.

Ler o cabeçalho só é seguro porque o security group da task aceita entrada
**exclusivamente do ALB** (`infra/network.tf`). Se essa regra for afrouxada, esta
decisão também cai.

## Ver também

- `docs/adr/0017-subrede-publica.md` — por que a task fica em sub-rede pública
