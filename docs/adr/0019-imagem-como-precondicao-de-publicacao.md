# ADR-0019 — Imagem do look é pré-condição de publicação, não coluna obrigatória

## Status

Aceita — 10/09/2026.

## Contexto

A RFC v1.1 e a migration `0001` declaram `looks.image_url TEXT NOT NULL`. A regra de
negócio é que look **publicado** precisa de imagem: quem descobre moda decide pela
foto, e um card sem imagem no feed não comunica nada.

Mas o fluxo de criação é incremental — a pessoa monta o look, cola os links das peças
e só então gera ou envia a imagem. Com a coluna obrigatória, não existe rascunho: ou
a imagem entra na primeira requisição, ou o look não pode nascer.

## Decisão

`image_url` passa a aceitar nulo, e a imagem vira **pré-condição de publicação**,
verificada em `LookService.publish` junto da RN04.

## Consequências

Um rascunho sem imagem passa a existir, e o editor pode salvar o trabalho parcial em
vez de exigir tudo de uma vez.

A regra sai do banco e vai para o serviço. Isso é bom e é ruim: bom porque a recusa
vira `LOOK_WITHOUT_IMAGE`, uma mensagem que a pessoa entende, em vez de um erro de
constraint que vira 500; ruim porque o banco deixa de ser a última linha de defesa —
se alguém publicar por outro caminho que não o serviço, nada impede.

Enquanto `publish` for o único lugar que escreve `status = 'published'`, a garantia se
mantém. Se aparecer um segundo caminho — importação em massa, seed, painel
administrativo — a regra precisa ser reaplicada lá, ou virar `CHECK` no banco.

A RFC v1.1 foi atualizada junto com esta mudança: documento que descreve schema
diferente do que a migration cria é pior que documento ausente.
