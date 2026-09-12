# ADR-0021 — Ocasião é o eixo único de categoria do look

Data: 11/09/2026 · Status: aceita

## Contexto

A RFC descreve, na Tela 2, um feed com "filtros de categoria em pills horizontais" e
cards que exibem "as tags de estilo". A tabela `looks` na mesma RFC vai de `title` a
`status` sem nenhuma coluna para isso. As duas seções se contradiziam: o desenho
prometia um filtro que o schema não tinha onde guardar.

Na conversa sobre como preencher esse buraco apareceram dois eixos misturados —
ocasião (social, trabalho, praia) e estação (verão, inverno) — e a ideia de dar um
ícone a cada valor.

## Decisão

Um eixo só, de **ocasião**, na coluna `looks.category`, com seis valores:
`work`, `casual`, `social`, `party`, `beach`, `sport`.

Valor em inglês porque é nome de domínio; rótulo em português porque é tela. Cada um
tem ícone próprio, exibido na ponta do card e na pill do filtro — sempre acompanhado
do rótulo em texto, porque desenho sozinho não comunica a quem usa leitor de tela.

**Não são dois campos.** Estação ficou de fora: praia já carrega verão dentro, festa
já carrega noite, e o risco concreto de um segundo campo é ele nascer opcional e ficar
vazio para sempre — filtro que quase ninguém preenche é pior que filtro nenhum, porque
esconde resultado sem avisar.

A coluna é **nulável, com `CHECK` na lista de valores**. Rascunho pode não ter ocasião;
quem exige é a publicação, em `LookService.publish`, junto da peça e da imagem. Mesmo
desenho do ADR-0019: a regra mora no serviço, onde vira mensagem que a pessoa entende,
e o `CHECK` fica como última linha de defesa contra escrita por outro caminho.

## Consequências

Todo look do feed é filtrável, porque não existe publicado sem ocasião. Um filtro que
admitisse look sem categoria nasceria com buraco: a pessoa escolhe "Praia" e alguns
looks de praia não aparecem porque ninguém marcou.

Acrescentar valor depois é barato — troca o `CHECK` e a lista no frontend, sem migrar
dado. Tirar valor é caro, porque exige decidir o que fazer com os looks que já o usam.
A lista nasceu curta por isso.

A terceira pré-condição de publicação expôs um teste que passava pelo motivo errado:
`test_publicado_troca_a_imagem_por_outra` seguia verde porque a publicação passou a
falhar em silêncio e ele media um rascunho. As três pré-condições foram reunidas num
helper que confere o status — quando entrar a quarta, o teste quebra em vez de mentir.

A RFC foi corrigida junto: a tabela `looks` ganhou a coluna que o desenho do feed já
prometia.
