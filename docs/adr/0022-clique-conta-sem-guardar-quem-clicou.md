# ADR-0022 — O clique conta sem guardar quem clicou

Data: 17/09/2026 · Status: aceita

## Contexto

A RN08 diz que o clique só conta quando há redirecionamento efetivo, e a RN09 que as
métricas são visíveis só para o creator do look. Para provar a primeira é preciso que
o redirecionamento passe por nós — enquanto a página aponta direto para a loja, não
existe lugar onde observar que o clique levou a algum lugar.

A tabela `clicks` nasceu na migration `0001` com uma coluna `ip_hash`, e a política de
privacidade **não declara** coleta de clique. Decidir o que fazer com essa coluna é
decidir se a política precisa mudar.

Separadamente: o link de compra é digitado por quem monta o look. A validação existente
recusa esquema que não seja `http`/`https`, o que fecha o vetor contra a própria
plataforma — `javascript:` executaria script no nosso domínio. O que ela não faz é
dizer se um site real é perigoso.

## Decisão

**A saída passa por `/r/{peça}`.** A rota registra o clique e devolve 307 para a loja.
Contar e redirecionar viram o mesmo ato; contador que dispara sem levar a lugar nenhum
mede intenção, não clique. A rota é do Next, não da API, para o navegador seguir sem
conhecer o endereço do backend.

**`ip_hash` fica vazia.** A RN09 precisa de contagem, não de quem clicou. IP com hash
continua apontando para pessoa, e não coletar é a posição mais forte — mantém a
política de privacidade verdadeira do jeito que ela já está escrita. A coluna
permanece no schema; usá-la exige nova decisão e nova redação da política.

**Safe Browsing na entrada, não no clique.** O link é consultado ao cadastrar a peça.
Consultar a cada redirecionamento poria o Google no caminho de quem está comprando, e
somaria latência de terceiro ao gesto mais importante do produto.

**A consulta falha aberta.** Sem chave configurada, o cliente não toca na rede. Se o
Google não responder, o cadastro passa. Derrubar o cadastro por indisponibilidade de
terceiro puniria o creator por algo que não é dele nem nosso.

## Consequências

O link deixa de ser o endereço da loja: quem passa o mouse vê o nosso domínio. É o
comportamento de qualquer programa de afiliado, mas é mudança visível — em troca, a
página do look passa a **escrever o domínio de destino** na linha de cada peça.

O ponto único de passagem é o que torna barato plugar qualquer verificação futura: é
um arquivo, não trinta.

Lista de **bloqueados**, nunca de permitidos. Loja pequena e desconhecida não é loja
maliciosa, e uma lista de permitidos mataria a cauda longa que é o produto — a creator
que linka o brechó da amiga não conseguiria publicar. Desconhecido passa; sabidamente
ruim não passa.

Falhar aberto significa que um período de indisponibilidade do Google deixa entrar link
que seria recusado. É trade-off consciente: a alternativa é o produto parar quando um
terceiro para.

A RN06 continua valendo — a validade comercial do link é do creator. Isto não é
curadoria, que está fora de escopo na RFC; é recusa de endereço sabidamente usado para
phishing ou malware.
