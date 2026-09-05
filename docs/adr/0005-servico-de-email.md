# ADR-0005 — Brevo para o e-mail transacional

Data: 31/08/2026 · Status: aceita

## Contexto

O RF03 exige recuperação de senha por e-mail. Enviar e-mail transacional de um
servidor próprio não é viável: provedor de nuvem bloqueia a porta 25 por padrão, e um
IP sem reputação vai direto para spam — justamente no e-mail que o usuário está
esperando.

A restrição real é orçamento. O projeto tem **US$ 120 de crédito AWS** para durar até
dezembro, e o e-mail não pode consumir nada disso.

## Alternativas consideradas

**A — AWS SES.** Fica na mesma conta da infraestrutura e é o mais barato por volume.
Começa em **sandbox**: só envia para endereços verificados um a um, e sair de lá exige
abrir chamado e justificar o caso de uso. Para um TCC que precisa enviar para o
avaliador e para usuários da validação, é um pedido de aprovação no caminho crítico.

**B — Resend.** Melhor experiência de desenvolvedor das três e verificação de domínio
mais simples. Plano gratuito de **100 e-mails/dia com teto de 3.000/mês** — verificado
na página de preços em 31/08.

**C — Brevo.** Plano *"free forever, no credit card needed"*, com **300 e-mails/dia**
— verificado na mesma data, e o FAQ deles confirma que não pede cartão. A API é um
POST em `https://api.brevo.com/v3/smtp/email` com um header `api-key`, sem SDK.

## Decisão

**C.** O envio fica isolado em `app/clients/brevo.py`, atrás da função `send_email`.

O que pesou, na ordem: já existe **integração funcionando no `ta-no-preco-api`** do
mesmo autor, feita por `fetch` direto sem SDK — o mesmo desenho traduz para `httpx` em
poucas linhas, e os modos de falha já são conhecidos. O limite é 3x o do Resend. E
nenhum dos dois consome crédito da AWS.

## Consequências

**O que fica mais fácil**

- Zero custo e nenhuma dependência de aprovação, ao contrário do sandbox do SES.
- Uma dependência nova só (`httpx`), sem SDK proprietário no caminho.
- O cliente é uma função com uma responsabilidade, então trocar de provedor é reescrever
  um arquivo — nenhuma outra camada sabe que a Brevo existe.

**O que passa a custar caro**

- **O plano gratuito carimba "Sent with Brevo" no rodapé.** Some só nos planos pagos.
  Num e-mail de recuperação de senha isso é irrelevante; se algum dia houver e-mail de
  marketing, deixa de ser.
- **Enviar como `@dominio-proprio` exige o domínio verificado**, e o domínio ainda não
  foi comprado. Até lá o remetente é o de teste do provedor, o que serve para
  desenvolvimento e **não** serve para a demo.
- **300/dia é limite de verdade.** Um teste de carga que dispare e-mail bate no teto e
  os envios do dia param. O teste de carga da Sprint 7 não deve tocar este caminho.
- Sair da Brevo depois significa reescrever `clients/brevo.py` e trocar as variáveis de
  ambiente. É barato hoje e fica mais caro quanto mais o projeto depender de recursos
  específicos deles, como os webhooks de entrega.
- **A Brevo injeta `List-Unsubscribe` em todo e-mail transacional, e não dá para
  desligar.** Descoberto em 01/09/2026, no primeiro envio real: o Gmail mostra
  "Cancelar inscrição" ao lado do remetente num e-mail de recuperação de senha. A
  própria Brevo confirma que o cabeçalho é automático "por compliance" e que trocá-lo
  por `List-Help` **só existe no plano Enterprise**.

  Medido em 03/09/2026, clicando no link para ver o efeito. A sequência observada nos
  logs da Brevo:

  | Horário | Evento |
  |---|---|
  | 18:37 | `Unsubscribed` — um clique, um e-mail de reset |
  | 18:52 | `Sent` seguido de `Blocked` — o envio seguinte nunca entregou |

  **O grave não é o bloqueio; é a aplicação ser cega para ele.** A Brevo responde
  **2xx** à chamada da API e só depois marca `Blocked`. Então `raise_for_status()`
  passa, nenhuma `EmailDeliveryFailed` é levantada, `deliver()` **não invalida o
  token** — e o sistema inteiro acredita que enviou. O usuário fica sem o e-mail, sem
  mensagem de erro, e com um token válido pendurado por uma hora que ninguém recebeu.

  Detectar isso exigiria os **webhooks de entrega** da Brevo, que precisam de endpoint
  público — não existe antes do deploy. Até lá, esta falha é invisível.

  Duas armadilhas de diagnóstico, também medidas: a ficha do contato continua exibindo
  *"Transactional emails — Subscribed"* enquanto o log diz `Blocked`, ou seja **a tela
  de contato não serve para diagnosticar**; e a única evidência fica no log de
  transacional.

  Existe um `DELETE /smtp/blockedContacts/{email}`, mas **ele não pode virar automação**:
  a própria Brevo diz que desbloquear quem pediu para sair é ilegal e motivo de suspensão
  da conta. É caminho de suporte humano com pedido do titular, nunca um `except`.

  Aceito por ora — as alternativas são pagar Enterprise ou trocar de provedor. Mas o
  cenário deixou de ser hipotético: **um clique, e o usuário perde o caminho de
  recuperação da própria conta, sem que o sistema saiba.** Revisar este ADR quando os
  webhooks existirem, ou antes disso se um usuário real for afetado.

## O que este ADR não decide

**O envio não está ligado.** `BREVO_API_KEY` não existe em nenhum ambiente, e sem ela o
cliente registra um aviso e levanta `EmailDeliveryFailed` — o token de reset é criado
do mesmo jeito, então o fluxo é testável ponta a ponta sem provedor.

Ligar de fato depende de comprar o domínio e verificar o remetente. Enquanto isso não
acontece, **o RF03 está entregue como fluxo e pendente como entrega** — que é
exatamente o que a nota da Sprint 2 autoriza, desde que registrado. Este parágrafo é o
registro.

> **Atualização de 01/09/2026 — ligado e verificado.** `vesteai.site` comprado e
> autenticado na Brevo (Brevo code, dois DKIM e DMARC), e o primeiro envio real
> percorreu a cadeia inteira: `Sent → Delivered → Opened`, caixa de entrada do Gmail,
> remetente `nao-responda@vesteai.site`. O `href` do botão chega **sem reescrita de
> rastreamento**, apontando direto para o frontend. O RF03 deixa de ser pendente como
> entrega no ambiente local; em produção depende de `BREVO_API_KEY` no Secrets Manager
> e de `FRONTEND_RESET_URL` preenchida — as duas agora existem no Terraform.
