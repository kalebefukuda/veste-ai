# ADR-0027 — A foto da peça é enviada, e gerar com IA exige foto em todas

Data: 06/11/2026 · Status: aceita

## Contexto

A foto da peça era um endereço colado, opcional. Era dela que a geração por IA tirava a
referência do que o modelo veste: o backend baixava cada endereço na hora de gerar.
Isso tinha três problemas:

1. **Depender da loja.** Endereço de foto de loja muda e some. Uma loja fora do ar tirava
   a peça da composição em silêncio.
2. **Buscar endereço escolhido por quem cadastra** é a porta do SSRF que a PR #45 teve de
   fechar com barreira de IP.
3. **Peça sem foto não tem como ser vestida.** A geração seguia com as peças que tinham
   foto, e a imagem mostrava um look diferente do que estava à venda.

Com o bucket no ar (ADR-0025), a foto da peça pode morar no mesmo lugar que a do look.

## Decisão

**A foto da peça é enviada como arquivo**, com a mesma conferência pelos bytes e o mesmo
teto de 5 MB da foto do look. Fica numa coluna própria, `image_key`, com a chave
`looks/{look}/pieces/{peça}/{uuid}`, e vira endereço assinado na leitura. O campo de
endereço sai da tela; a API continua lendo `image_url` das peças que já existiam, para
nenhuma perder a foto.

**A foto continua opcional para cadastrar a peça.** A RN05 do RFC não muda: nome e link
de compra seguem sendo o que a peça exige.

**Gerar com IA exige foto em todas as peças.** Se faltar, a geração é recusada com
`PIECES_WITHOUT_PHOTO` e a lista das peças, sem chamar o Gemini. A tela marca a peça
com "Falta a foto" e deixa enviar ali mesmo, no card.

**A foto enviada vai do bucket direto para o modelo.** Só a peça antiga, com endereço
colado, ainda é baixada — e continua passando pela barreira de IP.

## Consequências

Uma loja fora do ar deixa de afetar as peças novas, e o caminho de SSRF fica restrito às
peças antigas.

A peça é criada antes da foto subir. Se o envio falhar, ela fica no look marcada sem
foto, e reenviar é um clique — o mesmo caminho que serve às peças antigas sem foto.

O modelo de imagem do Gemini funciona melhor com até três imagens de entrada. Look com
mais peças continua sendo gerado, mas a qualidade pode cair. Montar as peças numa
imagem só, ou limitar a quantidade com aviso, fica para quando a referência fixa de
modelo entrar, porque ela também ocupa uma imagem de entrada.
