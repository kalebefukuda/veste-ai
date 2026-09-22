# ADR-0023 — O favorito vive fora do feed público

Data: 17/09/2026 · Status: aceita

## Contexto

A RN02 diz que só autenticado salva favorito. A RN03 diz que o feed é público, e o
ADR-0020 registrou a consequência disso em código: `GET /feed` não lê sessão, e é a
única parte da API que é assim.

O coração precisa nascer preenchido no que a pessoa já salvou. Isso parece exigir que o
feed saiba quem está olhando — exatamente o que o ADR-0020 decidiu evitar.

## Decisão

O feed continua sem sessão. O estado dos corações vem por fora, em `GET /saved/ids`,
que responde só para quem tem token e devolve **apenas os ids**. A página do feed faz
as duas leituras e entrega a lista para a vitrine.

Salvar é `POST /saved/{look}`, desfazer é `DELETE`. Os dois são idempotentes: o coração
é um interruptor, e o segundo toque não pode virar erro nem linha repetida — mesmo com
a restrição única do banco por trás.

Só se salva look **publicado**. Guardar um rascunho seria guardar o endereço de algo
que a pessoa não consegue abrir.

Para visitante o coração **aparece e leva ao cadastro**. Esconder a função esconderia
junto um dos motivos de criar conta; fingir que salvou seria pior, porque o favorito
sumiria no primeiro recarregamento.

## Consequências

Duas requisições em vez de uma para montar o feed de quem tem conta. Elas saem em
paralelo e a segunda devolve só uma lista de ids, então o custo é uma ida à rede, não
uma consulta cara. Em troca, `GET /feed` continua cacheável e sem nada de pessoal na
resposta — o mesmo corpo serve a todo mundo.

A idempotência mora no `INSERT ... ON CONFLICT DO NOTHING`, não numa conferência antes
de inserir: entre conferir e gravar cabe outra requisição, e a segunda estouraria na
restrição única do banco — 500 em cima de um gesto que deu certo.

O coração é otimista: responde ao toque e volta atrás se a API recusar. E **avisa**
quando volta atrás. Desfazer em silêncio foi um defeito real desta entrega — o coração
piscava, voltava, e quem clicou ficava sem saber se guardou; o servidor fora do ar
aparecia na tela como se o clique não fizesse nada.

Favoritar solta um brilho; desfavoritar, não. Comemorar a remoção celebraria o
contrário do que a pessoa fez. Quem tem movimento reduzido ligado recebe a marcação sem
o estouro.
