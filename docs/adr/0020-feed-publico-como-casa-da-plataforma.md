# ADR-0020 — Feed público é a casa da plataforma

Data: 11/09/2026 · Status: aceita

## Contexto

A área logada nasceu com `/inicio` mostrando os looks da própria pessoa. Funcionava
enquanto só existia o editor, mas inverte o produto: o VesteAí é vitrine de curadoria,
e quem entra quer ver o que os outros montaram — não a própria estante, que na conta
nova está vazia.

A RN03 já dizia o que fazer: feed e links de compra são públicos, sem autenticação.
Faltava a tela.

## Decisão

`/feed` é a casa da plataforma. É público: serve visitante e pessoa logada com o mesmo
conteúdo, e só o cabeçalho muda de cara. `/` continua sendo a landing para quem não
tem sessão e redireciona para o feed quem tem — ver a página de venda depois de já ter
comprado a ideia é ruído.

A estante da pessoa vira `/meus-looks`, endereçada pelo menu do avatar. O look público
mora em `/feed/{id}`, mesma forma da rota da API.

A paginação devolve `next_page` em vez de total. Contar a tabela inteira a cada
requisição custa caro e não muda o que a tela faz, que é decidir se ainda há o que
carregar; o serviço busca um registro a mais que o pedido e usa a sobra como resposta.

## Consequências

O visitante navega a primeira página inteira e depois encontra um convite no lugar do
"carregar mais" — o limite do Pinterest, não um muro na porta.

**Esse limite é de tela, não de API.** `GET /feed?page=3` responde a qualquer um, com
ou sem conta. Foi decisão consciente: enforcement de verdade exigiria a rota pública
ler sessão, e a RN03 existe justamente para que ela não precise. Quem quiser raspar o
feed vai raspar de qualquer jeito; o convite é para quem está navegando, não uma
barreira contra robô. Se um dia o limite precisar valer, ele muda de camada — e essa
troca exige rever esta ADR.

A landing deixou de ser estática: ler o cookie de sessão obriga renderização dinâmica.
Ela continua devolvendo HTML completo, então o custo é de cache, não de SEO.

`Look.creator` entrou no model com carga preguiçosa e `joinedload` explícito na
consulta do feed. Eager por padrão faria toda leitura de look — inclusive as do editor,
que não mostram o autor — pagar um join que só a vitrine usa.
