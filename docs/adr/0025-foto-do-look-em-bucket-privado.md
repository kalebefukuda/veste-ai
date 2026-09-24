# ADR-0025 — A foto do look vai para bucket privado, com endereço assinado

Data: 24/09/2026 · Status: aceita

## Contexto

Até aqui a imagem do look era um endereço colado à mão no campo `image_url`. Isso
serve para demonstrar e não serve para o produto: quem monta look não hospeda foto em
lugar nenhum, e o feed inteiro dependia de URLs de terceiros que podem sumir a
qualquer momento.

O RF17 pede upload de foto de referência. O bucket já está descrito no
`infra/storage.tf` — privado, com bloqueio de acesso público, criptografia e
versionamento — e a task do ECS já tem permissão de `GetObject`, `PutObject` e
`DeleteObject`. O que não existe é o bucket aplicado.

## Decisão

**Coluna própria, `image_key`.** Não dá para reaproveitar `image_url`: o endereço
assinado expira, então o que se guarda é a chave no bucket. Endereço colado continua
valendo em `image_url`, e a pré-condição de publicação aceita qualquer um dos dois —
os looks que já existem não podem parar de ter foto por causa de uma coluna nova.

**Endereço assinado com validade curta**, resolvido na leitura por uma fábrica única.
Ela é chamada no feed, no perfil, nos salvos, na lista do creator e no editor;
resolver por rota deixaria a foto invisível justo na tela esquecida.

**O arquivo passa pelo backend.** O SDK e a credencial da AWS não saem da camada de
`clients`. O que vai para o navegador é só o endereço assinado, dentro de um `<img>` —
o mesmo que já acontece hoje com `images.unsplash.com`. A fronteira da RFC — "o
frontend nunca fala com S3 direto" — é sobre o código integrar o S3, não sobre o
navegador buscar um arquivo.

**A conferência é nos bytes, não no cabeçalho.** `Content-Type` é escrito por quem
envia; um executável renomeado passaria. A assinatura no começo do arquivo é o que
separa imagem de qualquer outra coisa. Tipo fora da lista, assinatura que não bate ou
arquivo acima de 5 MB são recusados com código próprio.

**Sem bucket configurado, 503 e não 500.** A funcionalidade existe e está desligada;
dizer isso é melhor que estourar erro genérico ou fingir que guardou. A tela traduz
para "o envio ainda não está disponível — cole um endereço por enquanto".

## Consequências

Local e produção rodam o mesmo caminho: o que muda é a variável de ambiente. Não há
implementação paralela de desenvolvimento para manter, e nenhum caminho que só seja
exercitado quando chegar em produção.

Enquanto o bucket não existir, o upload aparece na tela e recusa com recado. É
deliberado — a alternativa seria esconder a funcionalidade e reabrir a tela depois,
ou guardar em disco local, que é código que só existe para desenvolvimento.

O arquivo passar pelo backend custa memória e banda da API, coisa que um upload
assinado direto para o S3 não custaria. É o preço de manter a credencial numa camada
só, e no volume deste projeto não pesa. Se um dia pesar, a troca é para upload
assinado — e essa mudança volta a esbarrar na fronteira da RFC, então exige rever esta
decisão.

A chave carrega o id do look e um `uuid`: o bucket fica legível, e trocar a foto não
colide com a anterior em cache.

O formato 3:4 que a vitrine trava **não é imposto no upload**. Recusar foto fora da
proporção rejeitaria quase toda foto real; o recorte fica na tela, com `object-cover`.
Quando a geração por IA entrar, aí sim o 3:4 vira contrato do prompt — lá a proporção
é escolha nossa, não da câmera de quem enviou.
