# ADR-0028 — A geração de imagem passa pelo Vertex AI

Data: 06/11/2026 · Status: aceita

## Contexto

A geração chamava a API do Gemini pelo AI Studio (`generativelanguage.googleapis.com`),
com o modelo `gemini-2.5-flash-image`. Na hora de ligar de verdade, três coisas
apareceram:

1. **O plano gratuito do AI Studio não gera imagem.** A cota do modelo de imagem é zero
   sem faturamento: a resposta é 429 com `limit: 0`.
2. **O crédito de avaliação do Google Cloud não cobre o AI Studio.** Ele cobre o Vertex
   AI (no console, "Agent Platform"). Pelo AI Studio, cada imagem sairia do bolso desde a
   primeira.
3. **A família 2.5 não está liberada para projeto novo no Vertex.** No projeto
   `vesteai-gemini`, o `gemini-2.5-flash-image` responde 404. O
   `gemini-3.1-flash-lite-image` responde, e devolve JPEG.

## Decisão

**A API chama o endpoint global do Vertex AI**, com o projeto no caminho:
`aiplatform.googleapis.com/v1/projects/{projeto}/locations/global/publishers/google/models/gemini-3.1-flash-lite-image:generateContent`.
O pedido marca a mensagem como do usuário (`role: "user"`), que o Vertex exige.

**A chave fica onde estava**, em `GEMINI_API_KEY`: `.env` no ambiente local e Secrets
Manager na AWS. Ela vai no cabeçalho `x-goog-api-key`, nunca na URL. É uma chave
vinculada à conta de serviço `vesteai-gemini`, com o papel `roles/aiplatform.user` e
restrita à API do Vertex: vazada, ela só gera imagem, sem acesso ao resto do projeto.

**O projeto vem de `GEMINI_PROJECT`**, com padrão `vesteai-gemini`. Não é segredo, por
isso fica fora do Secrets Manager, e a task definition não muda.

## Consequências

As gerações saem do crédito de avaliação enquanto ele durar, e depois do saldo da
conta. Pela tabela do Google, cada imagem fica na casa de US$ 0,04. A conferência é a
fatura, não esta estimativa.

O formato da resposta não mudou, e o JPEG já era reconhecido pelos bytes desde a PR #45.
Nada acima do cliente percebe a troca.

O pedido leva as fotos das peças, o preset do modelo e a descrição do look. Nenhum
dado da conta de quem gera vai junto.

O endpoint `global` deixa o Google escolher onde processar. Fixar uma região exigiria um
modelo disponível nela, e o de imagem que respondeu está no `global`.

Fica em aberto um teto de gerações por pessoa. Hoje só vale o limite por minuto da rota.
