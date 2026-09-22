# ADR-0024 — O perfil público mora em `/@handle`

Data: 22/09/2026 · Status: aceita

## Contexto

O handle existe desde a Sprint 2: escolhido no onboarding, guardado em minúscula,
único, com lista de palavras reservadas. E não endereçava nada — aparecia na página do
look como texto morto.

A convenção do mercado para perfil é o caminho na raiz: `/biacosta`. Foi para isso que
a lista de reservados nasceu, com `admin`, `api`, `login`, `perfil`, `privacidade`.

## Decisão

O perfil mora em **`/@handle`**, não em `/handle`.

A rota é `app/(public)/(vitrine)/[handle]`, e endereço que não começa com `@` responde
404 — o segmento dinâmico captura os dois, e só um é perfil.

O perfil reusa a **mesma consulta do feed**: mesmo join, mesma exigência de ocasião,
mesma ordem. Um recorte que divergisse mostraria no perfil um look que a vitrine não
mostra.

Feed e perfil passam a dividir um layout, através de um grupo de rotas `(vitrine)`. A
política de privacidade fica fora dele porque tem cabeçalho próprio, com volta para a
landing — dentro do grupo ela ganharia dois cabeçalhos empilhados.

## Consequências

**O perfil nunca disputa caminho com rota nossa.** Com `/handle` na raiz, cada rota nova
teria que entrar na lista de reservados para sempre — e pior: um handle criado antes da
rota quebraria o site no dia em que a rota nascesse. Já aconteceria hoje, porque a
lista tem `inicio`, que não existe mais, e não tem `feed`, `salvos` nem `meus-looks`,
que existem.

A lista de reservados deixa de ser proteção de roteamento e vira proteção de marca —
impedir que alguém pegue `admin`, `suporte` ou `vesteai`. É o uso certo dela, e o que
sobra de responsabilidade é menor e mais estável.

O custo é estético: `/@biacosta` em vez de `/biacosta`. É a convenção do Instagram e do
Twitter, então não é estranha a quem vem dessas redes — que é exatamente o público da
RFC.

Quem ainda não escolheu handle aparece como texto, sem link, no card e na página do
look. Melhor não ter caminho do que ter um que dá 404.
