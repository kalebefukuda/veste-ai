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

## O que este ADR não decide

**O envio não está ligado.** `BREVO_API_KEY` não existe em nenhum ambiente, e sem ela o
cliente registra um aviso e levanta `EmailDeliveryFailed` — o token de reset é criado
do mesmo jeito, então o fluxo é testável ponta a ponta sem provedor.

Ligar de fato depende de comprar o domínio e verificar o remetente. Enquanto isso não
acontece, **o RF03 está entregue como fluxo e pendente como entrega** — que é
exatamente o que a nota da Sprint 2 autoriza, desde que registrado. Este parágrafo é o
registro.
