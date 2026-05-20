# RFC — VesteAí
**Request for Comments — Projeto de Portfólio**
Católica SC — Engenharia de Software — 8º Semestre

---

# Identificação

- **Título do Projeto:**  
  VesteAí

- **Linha de Projeto (Direction):**  
  Web

- **Autor:**  
  Kalebe Fukuda de Oliveira

- **Data da Proposta:**  
  08/04/2026

- **Versão:**  
  1.0

---

# 1. Visão do Produto e Impacto (O Problema)

## 1.1 Contexto e Problema

A moda é um dos maiores mercados de consumo online do Brasil. Plataformas
como Instagram, Pinterest e TikTok são amplamente utilizadas para inspiração
de moda, gerando alto engajamento com looks e combinações de peças. No
entanto, existe uma lacuna estrutural entre o momento de inspiração e o
momento de compra — e uma oportunidade de monetização ignorada para quem
cria conteúdo de moda de forma amadora.

**Quem sofre com esse problema**

Dois perfis distintos enfrentam barreiras hoje:

- **Consumidores** que encontram looks interessantes nas redes sociais mas
  não conseguem comprar as peças com facilidade — seja o look completo ou
  cada item individualmente.
- **Pessoas com interesse em moda** que gostariam de montar e divulgar looks
  usando peças de diferentes lojas e ganhar uma renda extra através de links
  de afiliado, mas não têm uma plataforma própria para isso.

**Em que contexto ocorre**

Ao encontrar um look interessante em qualquer rede social, o fluxo típico
do consumidor é:

1. Ver o look e se interessar
2. Tentar identificar cada peça manualmente (marca, modelo, loja)
3. Buscar cada peça em sites diferentes
4. Frequentemente não encontrar exatamente o que viu
5. Desistir da compra

Um exemplo real desse comportamento pode ser observado abaixo — um post de
moda no Instagram onde seguidores pedem nos comentários o preço e o link
das peças, sem receber nenhuma resposta centralizada:

![Instagram sem link](https://raw.githubusercontent.com/kalebefukuda/veste-ai/docs/rfc/docs/assets/instagram-no-link.png)

Do lado de quem quer criar conteúdo de moda, o problema é diferente:
não existe uma plataforma dedicada para montar looks com peças de múltiplas
lojas, associar links de afiliado a cada peça e publicar tudo em um único
lugar para gerar renda com as vendas que esse conteúdo influencia.

**Como é resolvido atualmente**

Não existe uma solução centralizada para nenhum dos dois lados. O consumidor
depende de buscas manuais em múltiplos e-commerces. Quem quer monetizar
curadoria de moda recorre a ferramentas genéricas como o Linktree ou
depende de comentários e stories nas redes sociais — sem controle sobre
métricas, sem organização por look e sem uma experiência dedicada para
o consumidor final.

Plataformas como Pinterest chegam a redirecionar para produtos similares
via Amazon, mas a solução é limitada: funciona apenas com o catálogo
americano, não suporta lojas brasileiras como Shopee, Shein, Renner ou C&A,
e não oferece nenhuma forma de monetização para quem criou o conteúdo:

![Pinterest Amazon](https://raw.githubusercontent.com/kalebefukuda/veste-ai/docs/rfc/docs/assets/pinterest-amazon.png)

**Limitações das soluções atuais**

As redes sociais entregam inspiração mas não oferecem links de compra
organizados por look. Os e-commerces oferecem compra mas não curadoria.
Ferramentas de link em bio são genéricas e não foram feitas para composição
de looks com múltiplas peças. O resultado é uma fricção alta na jornada
do consumidor e uma oportunidade de renda desperdiçada para quem tem
gosto por moda mas não tem onde canalizar isso.

## 1.2 Origem da Demanda e Evidências

### Pesquisa com Usuários

Foram realizadas conversas informais com 5 pessoas dos dois perfis de
usuário da plataforma. Não houve formulário estruturado — as conversas
seguiram um roteiro livre com foco em identificar dores no processo de
compra de moda online e no uso de links de afiliado.

**Perfis entrevistados:** consumidores de moda online e pessoas que já
utilizam links de afiliado em plataformas como Shopee.

**Principais dores identificadas:**

| Perfil | Dor relatada |
|---|---|
| Consumidor | Dificuldade em encontrar onde comprar peças de looks vistos nas redes sociais |
| Consumidor | Necessidade de pesquisar em vários sites para montar um look completo |
| Criador | Falta de uma plataforma dedicada para montar e publicar looks com links de afiliado |
| Criador | Dificuldade em organizar links de produtos de lojas diferentes em um só lugar |

**Padrão observado:** todos os entrevistados demonstraram interesse em uma
plataforma unificada para descoberta e compra de looks.

### Evidência de Interesse

O comportamento de busca por links nos comentários de posts de moda é um
padrão recorrente e documentado nas redes sociais. A imagem abaixo ilustra
um post no Instagram onde seguidores pedem o preço e o link das peças
diretamente nos comentários, sem receber nenhuma resposta centralizada —
evidência direta da dor que o VesteAí se propõe a resolver:

![Instagram sem link](https://raw.githubusercontent.com/kalebefukuda/veste-ai/docs/rfc/docs/assets/instagram-no-link.png)

### Contexto de Mercado

Os dados do mercado brasileiro reforçam que o problema ocorre em um
segmento de alto volume e crescimento acelerado:

- A moda é o **segmento líder do e-commerce nacional em volume**, com
  crescimento de 35% nas vendas em 2025, faturando R$ 2,9 bilhões segundo
  a pesquisa NuvemCommerce (2026).
- **66% dos brasileiros preferem comprar roupas, calçados e acessórios
  online**, segundo pesquisa "Consumo de moda no Brasil" do Opinion Box.
- O mercado brasileiro de **social commerce** — compras originadas
  diretamente das redes sociais — projeta crescimento de 16,1% ao ano,
  atingindo US$ 4,16 bilhões em 2025, segundo dados da Wake.
- O **Instagram é utilizado organicamente por 97% das lojas de moda**,
  o maior índice entre todos os setores do e-commerce nacional
  (NuvemCommerce, 2026).

Esses dados indicam que o comportamento de descoberta de moda pelas redes
sociais já é consolidado no Brasil — e que a lacuna entre inspiração e
compra ocorre justamente no segmento de maior crescimento do e-commerce
nacional.

## 1.3 Análise de Soluções Existentes (Benchmark)

### Pinterest
**Link:** https://pinterest.com  
**Público-alvo:** Usuários em busca de inspiração visual em geral  
**Funcionalidades principais:**
- Feed de imagens organizadas por interesse
- Redirecionamento automático para produtos similares via Amazon
- Salvar pins em coleções pessoais

**Limitações:**
- Redirecionamento funciona apenas com catálogo da Amazon (EUA)
- Não suporta lojas brasileiras como Shopee, Shein, Renner ou C&A
- O link de produto é gerado automaticamente por reconhecimento de imagem,
  não por curadoria intencional de um criador
- Não existe monetização para quem publicou o conteúdo original
- Não há conceito de "look completo" — cada peça é tratada isoladamente

---

### LTK (LikeToKnowIt)
**Link:** https://shopltk.com  
**Público-alvo:** Influenciadores de moda e consumidores globais  
**Funcionalidades principais:**
- Criadores publicam looks com links de afiliado de múltiplas lojas
- Feed navegável com looks completos e shoppable
- App dedicado com mais de 8 milhões de usuários mensais
- Parceria com mais de 7.000 varejistas globais

**Limitações:**
- Plataforma americana com foco no mercado norte-americano e europeu
- Não tem integração nativa com as principais lojas brasileiras
  (Shopee, Mercado Livre, Shein BR, Renner, C&A)
- Exige aprovação para criadores — não é aberto para qualquer pessoa
- Requer audiência prévia nas redes sociais para ser aceito como criador
- Interface e suporte em inglês, sem localização para o Brasil

---

### OQVestir
**Link:** https://oqvestir.com.br  
**Público-alvo:** Consumidores brasileiros de moda premium  
**Funcionalidades principais:**
- E-commerce multimarcas com mais de 300 marcas nacionais e internacionais
- Curadoria editorial com sugestões de looks prontos
- Seções "Looks da Semana" e "Novidades"

**Limitações:**
- É um e-commerce: só vende peças do próprio catálogo
- Não permite links de lojas externas (Shopee, Shein, etc.)
- Não existe figura de criador — a curadoria é feita internamente
  pela equipe editorial
- Não há monetização para usuários externos
- Foco em moda premium, excluindo o público que compra em marketplaces

---

### Instagram e TikTok
**Links:** https://instagram.com / https://tiktok.com  
**Público-alvo:** Criadores de conteúdo e consumidores em geral  
**Funcionalidades principais:**
- Publicação de fotos e vídeos de looks com grande alcance orgânico
- Link na bio para redirecionar seguidores
- Instagram Shopping para marcas parceiras

**Limitações:**
- Não existe uma forma nativa de organizar múltiplos links de afiliado
  por look — criadores dependem de ferramentas externas como Linktree
- O consumidor precisa sair da plataforma e buscar cada peça manualmente
- Não há rastreamento de cliques por peça ou por look
- Instagram Shopping só está disponível para marcas, não para criadores
  independentes com links de afiliado de múltiplas lojas
- O conteúdo se perde no feed com o tempo — não há organização por look

---

### Comparação

| Solução | Pontos Fortes | Limitações |
|---|---|---|
| Pinterest | Inspiração visual consolidada, grande base de usuários | Só integra Amazon (EUA), sem monetização para criadores, sem suporte a lojas BR |
| LTK | Modelo mais próximo do VesteAí, links de afiliado por look, app dedicado | Foco no mercado americano, sem lojas BR, exige aprovação e audiência prévia |
| OQVestir | Curadoria editorial brasileira, e-commerce consolidado | Catálogo fechado, sem criadores externos, sem links de lojas parceiras |
| Instagram/TikTok | Alcance massivo, criadores ativos em moda | Sem links organizados por look, sem rastreamento por peça, sem monetização direta |

---

### Diferencial do Projeto

**Por que criar algo novo?**

Nenhuma das soluções existentes resolve os dois lados do problema
simultaneamente para o mercado brasileiro:

- O **LTK** é a referência global mais próxima do VesteAí, mas é
  construído para o mercado americano e europeu. Não tem integração
  com as lojas onde o brasileiro de fato compra — Shopee, Mercado Livre,
  Shein, Renner e C&A — e exige que o criador já tenha uma audiência
  consolidada para ser aceito na plataforma.

- O **Pinterest** entrega inspiração mas não resolve a compra, e o
  **Instagram/TikTok** entregam alcance mas não entregam organização
  nem monetização estruturada.

- O **OQVestir** é brasileiro mas é um e-commerce fechado — a curadoria
  é editorial, não existe criador independente, e o consumidor só pode
  comprar peças do catálogo da própria plataforma.

**Qual lacuna o VesteAí preenche?**

O modelo do VesteAí é inspirado no LTK, plataforma americana que valida
globalmente que esse modelo funciona. O Brasil é o nono maior mercado de
e-commerce do mundo, com moda como categoria líder em volume — e não existe
nenhuma plataforma equivalente ao LTK construída para esse mercado.

O VesteAí preenche essa lacuna com dois diferenciais centrais:

1. **Focado no mercado brasileiro:** construído para o consumidor e o
   criador brasileiro, com compatibilidade com Shopee, Mercado Livre,
   Shein, Renner e C&A — as plataformas de e-commerce mais consumidas
   pelo público brasileiro
2. **Acesso aberto para criadores:** qualquer pessoa com gosto por moda
   pode criar um perfil e começar a monetizar, sem necessidade de
   audiência prévia ou aprovação editorial

## 1.4 Público-Alvo

O VesteAí atende dois perfis de usuário distintos:

### Consumidores

**Perfil:** Pessoas entre 18 e 35 anos com interesse em moda, que utilizam
redes sociais como Instagram, Pinterest e TikTok para buscar inspiração de
looks no dia a dia.

**Contexto de uso:** Navegam pelo feed em busca de looks completos para
ocasiões específicas — trabalho, lazer, eventos — e querem poder comprar
as peças sem precisar pesquisar em múltiplos sites.

**Nível técnico esperado:** Básico. Familiarizados com redes sociais e
compras online em marketplaces como Shopee e Mercado Livre.

---

### Criadores

**Perfil:** Pessoas com interesse em moda e senso estético desenvolvido,
que já montariam looks por prazer mas não têm uma plataforma dedicada para
publicar e monetizar essa curadoria. Não necessariamente possuem audiência
prévia em outras redes sociais.

**Contexto de uso:** Montam looks combinando peças de diferentes lojas,
associam links de afiliado a cada peça e publicam no feed da plataforma
para gerar renda extra com as compras que seus looks influenciam. Incluem
pessoas que já utilizam programas de afiliados em plataformas como Shopee.

**Nível técnico esperado:** Básico a intermediário. Familiarizados com
redes sociais e com o conceito de links de afiliado.

## 1.5 Objetivos do Projeto

### Objetivo Geral

Centralizar em uma única plataforma a descoberta e a compra de looks de
moda para o mercado brasileiro, eliminando a fricção entre inspiração e
compra para o consumidor e criando uma oportunidade de renda para pessoas
que têm gosto por moda mas não têm onde monetizar essa curadoria.

---

### Objetivos Específicos

1. Desenvolver um feed navegável de looks completos com links de compra
   centralizados, permitindo que o consumidor acesse todas as peças de
   um look em um único lugar
2. Construir um editor de looks que permita ao criador montar composições
   com peças de múltiplas lojas e associar links de afiliado a cada peça
3. Integrar o Google Gemini como ferramenta de apoio ao criador na
   composição visual dos looks
4. Registrar e exibir métricas de cliques por look, dando ao criador
   visibilidade sobre o desempenho do seu conteúdo
5. Disponibilizar a plataforma em produção como um produto funcional,
   acessível publicamente e validado com usuários reais

## 1.6 Métricas de Sucesso (KPIs)

- Pelo menos 5 looks publicados no feed por criadores reais até o Demo Day
- Pelo menos 1 clique em link de compra registrado por look publicado
- Suporte a 200 usuários simultâneos sem degradação de performance
- Cobertura mínima de 70% de testes unitários no back-end
- Integração com Google Gemini funcional com geração de imagem em menos
  de 30 segundos
- Aplicação acessível publicamente via URL estável em ambiente de produção


# 2. Engenharia de Requisitos
## 2.1 Personas

### Persona 1 — Creator

**Nome:** Isabela Rocha, 24 anos
**Contexto:** Estudante de moda em São Paulo, produz conteúdo no Instagram e TikTok há 2 anos. Tem cerca de 8 mil seguidores e recebe frequentemente perguntas como *"onde você comprou essa blusa?"*. Hoje responde nos comentários ou stories, mas os links se perdem rapidamente.

**Objetivos:**
- Centralizar os links das peças que usa em um único lugar
- Monetizar seu conteúdo através de comissões de afiliados
- Criar looks completos combinando peças de diferentes lojas (Shein, Renner, Shopee)
- Ganhar visibilidade além dos seus seguidores atuais

**Principais dificuldades:**
- Perde tempo respondendo manualmente onde cada peça foi comprada
- Não tem uma forma organizada de apresentar um look completo com múltiplos links
- Não consegue rastrear quantas pessoas clicaram nos seus links
- Ferramentas como Linktree são genéricas demais — não foram feitas para looks

---
### Persona 2 — Consumer

**Nome:** Mariana Costa, 27 anos
**Contexto:** Analista de marketing em Florianópolis, acompanha perfis de moda no Instagram e TikTok diariamente. Se inspira em looks que vê nas redes, mas frequentemente desiste da compra porque não consegue identificar onde cada peça foi comprada ou encontra apenas lojas internacionais sem entrega viável no Brasil.

**Objetivos:**
- Descobrir looks completos já montados, prontos para comprar
- Encontrar peças em lojas brasileiras com frete acessível
- Salvar looks que gostou para consultar depois
- Comprar o visual inteiro sem precisar gastar horas pesquisando cada peça

**Principais dificuldades:**
- Looks inspiracionais nas redes sociais raramente têm todos os links das peças
- Quando os links existem, muitas vezes apontam para lojas fora do Brasil
- Não há um lugar centralizado só para moda brasileira com curadoria humana
- Processo de "montar o look" é fragmentado e trabalhoso

## 2.2 Casos de Uso Principais

Os principais fluxos do sistema estão organizados em dois perfis de acesso: **Visitante** (não autenticado) e **Usuário Autenticado**. Qualquer usuário autenticado pode tanto consumir looks quanto publicar como creator — não há separação de contas.

**Visitante:**
- Explorar feed de looks
- Visualizar look completo
- Clicar em link de compra

**Usuário Autenticado:**
- Criar conta e configurar perfil
- Salvar looks favoritos
- Criar e publicar looks com peças e links de afiliado
- Editar e remover looks próprios
- Visualizar métricas de cliques nos seus looks

![Diagrama de Casos de Uso](../docs/assets/casos-de-uso-vesteai.png)

## 2.3 Requisitos Funcionais (RF)

### Acesso e Autenticação

RF01 — O sistema deve permitir que o visitante crie uma conta.
RF02 — O sistema deve permitir que o usuário faça login com e-mail e senha.
RF03 — O sistema deve permitir que o usuário recupere sua senha via e-mail.
RF04 — O sistema deve permitir que o usuário configure seu perfil (nome, foto e bio).

### Descoberta de Looks

RF05 — O sistema deve permitir que o visitante explore o feed de looks publicados.
RF06 — O sistema deve permitir que o visitante visualize um look completo com todas as peças e links.
RF07 — O sistema deve permitir que o visitante clique em um link de compra e seja redirecionado para a loja externa.

### Interação do Usuário Autenticado

RF08 — O sistema deve permitir que o usuário salve looks favoritos.
RF09 — O sistema deve permitir que o usuário acesse sua lista de looks salvos.

### Gestão de Looks (Creator)

RF10 — O sistema deve permitir que o usuário crie um look com título, descrição e foto de referência.
RF11 — O sistema deve permitir que o usuário adicione peças ao look com nome, link de afiliado e imagem.
RF12 — O sistema deve permitir que o usuário publique o look tornando-o visível no feed.
RF13 — O sistema deve permitir que o usuário edite um look já publicado.
RF14 — O sistema deve permitir que o usuário remova um look publicado.
RF15 — O sistema deve validar se o link de compra cadastrado está acessível e não redireciona para domínios sinalizados como maliciosos.

### Métricas

RF16 — O sistema deve registrar cada clique em links de compra e exibir o total por look ao usuário criador.

### Auxiliar de Criação

RF17 — O sistema deve permitir que o usuário faça upload de uma foto de referência ao criar um look.

## 2.4 Requisitos Não Funcionais (RNF)

### Desempenho

RNF01 — O feed de looks deve carregar em menos de 2 segundos em condições normais de rede.
RNF02 — O redirecionamento para links de compra deve ocorrer em menos de 500ms.
RNF03 — A API deve responder às requisições em menos de 300ms para operações de leitura.

### Segurança

RNF04 — O sistema deve utilizar autenticação segura com tokens JWT.
RNF05 — As senhas dos usuários devem ser armazenadas com hash utilizando bcrypt.
RNF06 — A comunicação entre cliente e servidor deve ser realizada exclusivamente via HTTPS.
RNF07 — O sistema deve proteger endpoints sensíveis contra acesso não autenticado.

### Disponibilidade

RNF08 — O sistema deve ter disponibilidade mínima de 99% ao mês.

### Escalabilidade

RNF09 — A arquitetura deve suportar o crescimento do volume de looks e usuários sem necessidade de refatoração estrutural.
RNF10 — O banco de dados deve ser estruturado para suportar paginação eficiente no feed de looks.

### Usabilidade

RNF11 — A interface deve ser responsiva e funcionar adequadamente em dispositivos móveis e desktop.
RNF12 — O fluxo de criação de um look deve ser concluído em no máximo 5 etapas.

## 2.5 Regras de Negócio

### Acesso e Autenticação

RN01 — Apenas usuários autenticados podem criar, editar e remover looks.
RN02 — Apenas usuários autenticados podem salvar looks favoritos.
RN03 — O feed de looks e os links de compra são acessíveis sem autenticação.

### Looks e Peças

RN04 — Um look só pode ser publicado se tiver ao menos uma peça com link de compra cadastrado.
RN05 — Cada peça de um look deve conter obrigatoriamente nome e link de compra.
RN06 — O creator é o único responsável pela validade dos links de compra — o VesteAí não valida nem garante os links externos.
RN07 — Um creator só pode editar ou remover looks criados por ele mesmo.
RN08 — Todo look deve conter ao menos uma imagem para ser publicado, seja por upload direto ou gerada por IA.

### Métricas

RN09 — O registro de clique é contabilizado apenas quando o usuário é redirecionado para a loja externa.
RN10 — As métricas de cliques são visíveis apenas para o creator do look.

## 2.6 Fora do Escopo

- O sistema não processará pagamentos diretamente — as transações ocorrem nas lojas externas
- O sistema não realizará integração direta com programas de afiliados — a gestão dos links é responsabilidade do creator
- O sistema não oferecerá funcionalidade de chat ou mensagens entre usuários
- O sistema não permitirá a venda de produtos diretamente na plataforma
- O sistema não realizará curadoria ou moderação automática de looks publicados

# 3. Fluxos e Comportamento do Sistema

Esta seção demonstra como o sistema funciona na prática, descrevendo os
caminhos percorridos pelos dois perfis de usuário da plataforma — consumer
e creator — e os desvios mais relevantes que o sistema deve tratar.

---

## 3.1 Fluxo Principal do Usuário

O VesteAí possui dois fluxos principais distintos, um para cada perfil de
usuário. Ambos são independentes e refletem jornadas fundamentalmente
diferentes: o consumer descobre e compra, o creator monta e publica.

---

### Fluxo do Consumer

O consumer acessa a plataforma sem necessidade de autenticação. A jornada
começa pela exploração do feed de looks publicados, onde pode abrir qualquer
look completo e visualizar todas as peças com seus respectivos links de
compra. O clique em um link redireciona o consumer diretamente para a loja
externa, que é o ponto de conversão central da plataforma.

Caso o consumer queira salvar um look nos favoritos, o sistema verifica se
está autenticado. Se não estiver, é direcionado para login ou cadastro antes
de concluir a ação. Se já estiver autenticado, o look é salvo imediatamente.
Essa é a única ação do consumer que exige autenticação — explorar o feed e
clicar em links de compra são acessíveis a qualquer visitante.

![Fluxo do Consumer](../docs/assets/fluxo-consumer.png)

---

### Fluxo do Creator

O creator precisa estar autenticado para publicar looks. Ao acessar a
plataforma, o sistema verifica se possui conta — caso contrário, passa pelo
cadastro e login antes de acessar o painel. A partir do painel, inicia a
criação do look adicionando título, descrição e as peças com seus respectivos
links de compra.

A etapa seguinte exige que o creator forneça uma imagem para o look, que é
obrigatória para publicação. Se já tiver uma foto do look, faz o upload
diretamente. Caso contrário, utiliza o assistente Gemini para gerar uma
imagem de referência. Sem imagem — seja por upload ou gerada pelo Gemini —
o look não pode ser publicado.

Antes de publicar, o sistema verifica se o creator está dentro do limite de
publicações do seu plano. Se tiver atingido o limite, é apresentada a opção
de upgrade para o plano Pro. Caso opte por não fazer o upgrade, o fluxo é
encerrado sem publicação. Caso faça o upgrade ou já esteja dentro do limite,
o look é revisado e publicado, tornando-se visível no feed da plataforma.
Após a publicação, o creator pode acompanhar as métricas de cliques no seu
painel.

![Fluxo do Creator](../docs/assets/fluxo-creator.png)

---

## 3.2 Fluxos Alternativos

Esta seção descreve os principais desvios do caminho feliz — situações de
erro, cancelamento ou exceção que o sistema deve tratar de forma explícita.

---

### FA01 — Visitante tenta salvar look sem autenticação

**Contexto:** O visitante clica em "salvar look" sem estar autenticado.

**Comportamento esperado:** O sistema interrompe a ação e exibe um prompt
de login ou cadastro. Após autenticação bem-sucedida, o sistema retoma a
ação e salva o look nos favoritos automaticamente, sem exigir que o usuário
repita o gesto.

---

### FA02 — Creator tenta publicar look sem imagem

**Contexto:** O creator conclui o preenchimento das peças e tenta publicar
sem ter fornecido uma imagem — nem por upload nem via Gemini.

**Comportamento esperado:** O sistema bloqueia a publicação e exibe uma
mensagem informando que a imagem é obrigatória. O creator permanece na tela
de criação e pode escolher entre fazer upload ou gerar via Gemini antes de
tentar publicar novamente.

---

### FA03 — Creator tenta publicar look sem nenhuma peça com link

**Contexto:** O creator tenta publicar um look sem ter adicionado nenhuma
peça com link de compra cadastrado.

**Comportamento esperado:** O sistema bloqueia a publicação e exibe uma
mensagem informando que ao menos uma peça com link de compra é obrigatória
(RN04). O creator permanece na tela de criação para completar o look antes
de tentar novamente.

---

### FA04 — Link de compra inválido ou malicioso

**Contexto:** O creator cadastra um link de compra que está inacessível ou
aponta para um domínio sinalizado como malicioso.

**Comportamento esperado:** O sistema executa a validação do link (RF15) e,
ao detectar o problema, exibe uma mensagem de erro indicando qual link falhou
na validação. O creator pode corrigir ou substituir o link antes de prosseguir.
Links que passam na validação técnica mas são inválidos comercialmente
permanecem sob responsabilidade do creator (RN06).

---

### FA05 — Erro na geração de imagem pelo Gemini

**Contexto:** O creator opta por gerar a imagem via Gemini, mas a requisição
falha por erro da API ou timeout.

**Comportamento esperado:** O sistema exibe uma mensagem de erro informando
que a geração não foi concluída e oferece duas opções: tentar novamente ou
fazer upload manual de uma imagem. O look em criação não é perdido — as
peças e links já cadastrados são preservados.

---

### FA06 — Creator atinge limite de publicações e não faz upgrade

**Contexto:** O creator tenta publicar um look mas já atingiu o limite de
publicações do plano gratuito e, ao ser apresentado ao upgrade Pro, decide
não prosseguir.

**Comportamento esperado:** O sistema encerra o fluxo de publicação sem
descartar o look. O rascunho é preservado no painel do creator, permitindo
que retome e publique quando decidir fazer o upgrade ou quando um slot
de publicação estiver disponível.

---

# 4. Mockups e Experiência do Usuário (UX)

> **Observação:** Os mockups apresentados nesta seção são a base para construção da aplicação. Eles
> representam a estrutura, os fluxos e a intenção de design da plataforma,
> mas não constituem o design final da interface. Elementos visuais como
> tipografia, espaçamento, paleta de cores e componentes estão sujeitos
> a revisão durante o desenvolvimento.

Esta seção apresenta a visualização inicial do produto antes da
implementação. Os mockups foram utilizados para validar o fluxo de
navegação, a organização da interface, as interações dos dois perfis de
usuário e a clareza da experiência como um todo.

---

## 4.1 Fluxo de Navegação

O VesteAí possui dois fluxos de navegação distintos, refletindo as
jornadas documentadas na Seção 3. Ambos partem do feed de looks como
tela central e divergem conforme o perfil e a intenção do usuário.

**Jornada do Consumer:**

![Fluxo do Consumidor](assets/jornada-consumidor.png)

**Jornada do Creator:**

![Fluxo do Criador](assets/jornada-criador.png)

Os diagramas completos, incluindo desvios e fluxos alternativos, estão
na [Seção 3](#3-fluxos-e-comportamento-do-sistema).

---

## 4.2 Wireframes e Mockups das Telas

### Tela 1 — Login e Cadastro

A tela de autenticação adota um layout dividido em dois painéis. O painel
esquerdo é visual e exibe o card de look característico da
plataforma com os floating badges de engajamento, reforçando a proposta
de valor do produto no momento de entrada do usuário. O painel direito
contém o formulário de autenticação com campos de e-mail e senha, opção
de login via Google e link para cadastro.

A mesma tela serve tanto para login quanto para o redirecionamento
descrito no FA01 — quando um visitante tenta salvar um look sem
autenticação, é encaminhado para esta tela e, após autenticar, retorna
automaticamente à ação interrompida.

**Requisitos cobertos:** RF01, RF02, RF03, RF04

![Login e Cadastro](assets/fluxo-user/login.png)

---

### Tela 2 — Feed de Looks

O feed é a tela central da plataforma e o ponto de entrada para o
consumidor. A navegação superior apresenta os filtros de categoria em
pills horizontais, permitindo que o usuário refine o conteúdo
sem sair da tela.

O conteúdo é organizado em um grid uniforme de quatro colunas, com
cards de proporção padronizada seguindo a convenção de marketplaces de
moda. Cada card exibe a foto do look, o handle do creator, o título,
as tags de estilo, a contagem de curtidas e um link direto para o look
completo. O visitante não precisa estar autenticado para navegar no feed
— a exploração é aberta a qualquer usuário (RN03).

**Requisitos cobertos:** RF05, RF06

![Feed de Looks](assets/fluxo-user/feed-look.png)

---

### Tela 3 — Detalhes do Look

A tela de detalhes é o ponto de conversão da jornada do consumer. O
layout é dividido em duas colunas: à esquerda, a imagem do look em
proporção destacada com badges de "IA Gerado" e contagem de curtidas;
à direita, o painel com título, tags, descrição e a lista de peças.

Cada peça exibe nome, loja, preço indicativo e um botão de acesso ao
link de compra externo. O botão principal "Ver todos os links de compra"
ao final da lista direciona o usuário para o carrinho, onde os links
ficam agregados antes do redirecionamento. Um aviso explícito informa
que o VesteAí não realiza cobranças — as transações ocorrem nas lojas
externas (RN06, seção 2.6).

**Requisitos cobertos:** RF06, RF07, RF08

![Detalhes do Look](assets/fluxo-user/detalhes-look.png)

---

### Tela 4 — Carrinho

O carrinho do VesteAí não é um checkout — não processa pagamentos nem
armazena dados financeiros. Sua função é agregar os itens salvos de
múltiplos looks e centralizar os links de compra externos em um único
lugar, eliminando a necessidade de o usuário abrir cada look
separadamente para acessar cada link.

Os itens são agrupados pelo look de origem, com o handle do creator
identificado em cada grupo. Cada item exibe nome, loja, preço indicativo
e um botão individual "Ir para compra →" que abre o link externo em
nova aba. O botão "Ir para todas as compras" no painel de resumo dispara
todos os links simultaneamente. Um aviso abaixo do botão reforça que o
VesteAí não realiza cobranças e que o usuário será redirecionado para
os sites das lojas.

**Requisitos cobertos:** RF07, RF08, RF09

![Carrinho](assets/fluxo-user/carrinho.png)

---

### Tela 5 — Editor de Looks

O editor é a tela central do fluxo do creator. O layout de duas colunas
separa responsabilidades visuais das informacionais: à esquerda, a área
de upload da imagem do look com o toggle de geração via IA; à direita,
os campos de nome, tags de estilo e a lista de peças com links.

Uma barra de progresso no topo da tela indica o avanço no processo de
criação. A lista de peças permite adicionar, visualizar e remover itens
individualmente, com o link de compra visível para cada peça cadastrada.
O botão "Publicar" na barra de navegação permanece desabilitado até que
os requisitos mínimos de publicação sejam atendidos — ao menos uma peça
com link e uma imagem (RN04, RN08).

**Requisitos cobertos:** RF10, RF11, RF12, RF13, RF14, RF15, RF17

![Editor de Looks](assets/fluxo-user/editor-look.png)

---

### Tela 6 — Painel do Creator

O painel centraliza as métricas de desempenho dos looks publicados pelo
creator. A tela é dividida em sidebar à esquerda — com seletor de
período e atalhos de navegação — e área principal à direita com os
indicadores e a tabela de performance.

Os dois cards de métrica exibem cliques totais e visualizações de looks,
ambas as métricas coletadas pela própria plataforma. A tabela "Performance
by Look" lista cada look publicado com data, volume de cliques representado
por uma barra proporcional e status de publicação. Não há dados financeiros
ou de comissão no painel — a monetização ocorre fora da plataforma, nos
programas de afiliados de cada loja, e é de responsabilidade do creator
(seção 2.6).

**Requisitos cobertos:** RF16

![Painel do Creator](assets/fluxo-user/creator-panel.png)

---

## 4.3 Fluxo de Interação do Usuário

### Fluxo do Consumer — Descoberta e Compra

1. Usuário acessa a plataforma e visualiza o **Feed de Looks** sem
   necessidade de autenticação
2. Aplica filtro de categoria (ex: "Minimalista") para refinar o conteúdo
3. Clica em um card de look para abrir os **Detalhes do Look**
4. Visualiza as peças, loja e preço indicativo de cada item
5. Clica em "Ver todos os links de compra" e é direcionado ao **Carrinho**
6. No carrinho, revisa os itens agrupados por look de origem
7. Clica em "Ir para todas as compras" e é redirecionado para as lojas
   externas em novas abas — a transação ocorre fora da plataforma

> **Desvio (FA01):** se o usuário tentar salvar um look sem estar
> autenticado, o sistema redireciona para a tela de **Login** e,
> após autenticação, retorna automaticamente ao look.

---

### Fluxo do Creator — Criação e Publicação

1. Creator acessa a tela de **Login** e autentica com e-mail/senha
   ou via Google
2. É direcionado ao **Feed de Looks** como tela inicial da sessão
3. Clica em "Create Look" na barra de navegação para abrir o **Editor**
4. Faz upload da foto do look ou aciona o toggle "Gerar modelo com IA"
5. Preenche o nome do look e seleciona as tags de estilo
6. Adiciona peças com nome, loja e link de compra externo
7. Clica em "Publicar" — o look passa a ser visível no feed publicamente
8. Acessa o **Painel do Creator** para acompanhar cliques e visualizações

> **Desvio (FA02/FA03):** se tentar publicar sem imagem ou sem peças
> com link, o sistema bloqueia e exibe mensagem orientando a completar
> os campos obrigatórios antes de prosseguir.

---

## 4.4 Feedback Inicial de Usuários

Os mockups foram apresentados informalmente aos mesmos 5 participantes
das conversas descritas na seção 1.2. As reações foram coletadas sem
formulário estruturado, com foco em identificar pontos de confusão ou
expectativas não atendidas na interface.

| Tela | Observação coletada |
|------|---------------------|
| Feed de Looks | Filtros de categoria foram considerados intuitivos; expectativa de busca por texto também foi mencionada |
| Detalhes do Look | A separação entre "ver o look" e "comprar as peças" ficou clara para todos os participantes |
| Carrinho | O aviso "VesteAí não realiza cobranças" foi considerado necessário e aumentou a confiança no fluxo |
| Editor de Looks | O toggle de geração por IA gerou curiosidade positiva; participantes demonstraram interesse em visualizar o resultado antes de publicar |
| Painel do Creator | A ausência de dados financeiros foi compreendida após explicação do modelo de negócio |

---

# 5. Arquitetura do Sistema

Esta seção descreve as decisões arquiteturais que estruturam o VesteAí como
sistema de software, organizando os componentes, suas responsabilidades e as
relações entre eles.

---

## 5.1 Diagrama C4

O modelo C4 organiza a arquitetura em níveis progressivos de detalhe: do
contexto geral do sistema até os componentes internos de cada serviço.

---

### Nível 1 — Contexto do Sistema

No nível de contexto, o VesteAí é tratado como uma caixa preta. O objetivo
é identificar quem interage com o sistema e quais sistemas externos ele depende,
sem detalhar como o sistema funciona internamente.

Dois atores humanos interagem diretamente com a plataforma. O **Visitante** é
qualquer pessoa que acessa o VesteAí sem autenticação — pode explorar o feed,
visualizar looks completos e clicar em links de compra. O **Usuário Autenticado**
representa o perfil unificado da plataforma: a mesma conta que salva looks
como consumidor também pode criar e publicar looks como creator. Não existe
separação de contas entre os dois comportamentos.

O VesteAí depende de três sistemas externos. A **Google Gemini API** é utilizada
pelo módulo de geração de imagem — quando o creator opta por não fazer upload
de uma foto e aciona o assistente de IA para gerar uma imagem de referência do
look. O **Stripe** processa exclusivamente a assinatura Pro do creator
(R$29/mês), que libera publicações ilimitadas de looks; a plataforma não
processa pagamentos de produtos nem armazena dados financeiros dos consumidores.
As **Lojas Externas de E-commerce** (Shopee, Mercado Livre, Shein, Renner, C&A
e demais) não integram com o VesteAí via API — o sistema apenas redireciona o
usuário para a URL cadastrada pelo creator, e a transação ocorre inteiramente
fora da plataforma.

![Diagrama C4 — Nível 1: Contexto](assets/c4-model/level-1-context.png)

---

### Nível 2 — Containers

No nível de containers, o interior do sistema é explicitado. O VesteAí é
composto por dois containers principais que se comunicam via HTTPS com
troca de dados em formato JSON.

O **Frontend** é construído com Next.js e combina renderização no lado do
servidor (SSR) para as páginas públicas — feed e detalhes de look — com
interatividade no lado do cliente para o editor de looks e o painel do
creator. O SSR é especialmente relevante para o feed, pois garante que o
conteúdo seja indexável por mecanismos de busca e carregue com baixa latência
para o visitante não autenticado. Toda a comunicação do frontend com o
backend ocorre por meio de chamadas HTTPS à API.

O **Backend** é uma API construída com FastAPI em Python. É responsável por
toda a lógica de negócio: autenticação de usuários, criação e publicação de
looks, registro de cliques em links, validação de URLs, orquestração da
requisição à Gemini e processamento de eventos do Stripe. O backend persiste
os dados no **PostgreSQL**, o banco de dados relacional central da aplicação.

A **Google Gemini API** e o **Stripe** são acessados exclusivamente pelo
backend — o frontend nunca se comunica diretamente com esses serviços. Esse
isolamento centraliza o controle de chaves de API e evita que credenciais
sensíveis sejam expostas no cliente.

![Diagrama C4 — Nível 2: Containers](assets/c4-model/level-2-containers.png)

---

### Nível 3 — Componentes

No nível de componentes, o interior do container FastAPI é detalhado. A API
segue uma arquitetura em camadas que separa responsabilidades de forma clara:
**routers** recebem as requisições HTTP e delegam para os serviços; **services**
concentram as regras de negócio; **repositories** encapsulam o acesso ao banco
de dados; e **clients** abstraem a comunicação com serviços externos.

Os principais componentes da API são:

**AuthService** — gerencia o ciclo de vida de autenticação: criação de conta
com senha armazenada como hash bcrypt, login com geração de token JWT e
validação do token nas rotas protegidas.

**LookService** — coordena as operações de criação, edição, publicação e remoção
de looks. Verifica as pré-condições de publicação (imagem obrigatória, ao menos
uma peça com link) e aplica a regra de limite de publicações por plano antes de
persistir o look como público.

**PieceService** — gerencia as peças associadas a cada look. Recebe nome, loja,
preço, imagem e link de compra de cada item. Aciona a validação de URL para
cada link cadastrado antes de confirmar o cadastro da peça.

**ClickTracker** — registra cada clique em link de compra externo. Ao receber
uma requisição de redirecionamento, persiste o evento na tabela `Click` com o
identificador da peça, o identificador do look, o `user_agent` e um hash do
endereço IP — sem armazenar o IP bruto — e então redireciona o usuário para a
URL externa. Esse componente é o responsável direto pela north star metric da
plataforma: contagem de cliques em links de compra.

**ImageService** — encapsula a integração com a Google Gemini API. Recebe uma
descrição textual do look, monta o prompt e envia a requisição para a API de
geração de imagem. Em caso de falha ou timeout, retorna um erro estruturado
para o LookService, que aciona o fluxo alternativo FA05 descrito na Seção 3.

**StripeClient** — abstrai a integração com o Stripe. Processa a criação da
assinatura Pro do creator e responde a webhooks de confirmação e cancelamento
de pagamento, atualizando o campo `plano` na entidade `User`.

**LinkValidator** — valida os links de compra cadastrados pelos creators. Verifica
se a URL está acessível (resposta HTTP válida) e se o domínio de destino não
consta em listas de domínios sinalizados como maliciosos. Não garante a validade
comercial do link — apenas a acessibilidade e a segurança técnica (RF15, RN06).

![Diagrama C4 — Nível 3: Componentes da API](assets/c4-model/level-3-components.png)

---

## 5.2 Modelo de Dados

O modelo relacional do VesteAí é composto por cinco entidades principais. O
diagrama a seguir representa as relações entre elas, seguido pelo esquema
relacional com os tipos de dados adotados no PostgreSQL.

![DER — Diagrama Entidade-Relacionamento do VesteAí](assets/c4-model/der.png)

---

### Relacionamentos

- `User` **1:N** `Look` — um usuário pode criar múltiplos looks; cada look
  pertence a exatamente um usuário.
- `Look` **1:N** `Piece` — um look é composto por múltiplas peças; cada peça
  pertence a exatamente um look.
- `Piece` **1:N** `Click` — um clique é sempre associado a uma peça específica
  e ao look ao qual essa peça pertence; cada registro de clique pertence a
  exatamente uma peça.
- `User` **N:M** `Look` via `SavedLook` — um usuário pode salvar múltiplos
  looks e um mesmo look pode ser salvo por múltiplos usuários; a entidade
  `SavedLook` representa essa associação com o registro da data de salvamento.

---

### Esquema Relacional

```sql
User (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         VARCHAR(100) NOT NULL,
  email        VARCHAR(255) NOT NULL UNIQUE,
  senha_hash   TEXT         NOT NULL,
  plano        VARCHAR(20)  NOT NULL DEFAULT 'free',  -- 'free' | 'pro'
  avatar       TEXT,
  bio          TEXT,
  created_at   TIMESTAMP    NOT NULL DEFAULT now()
)

Look (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID         NOT NULL REFERENCES User(id) ON DELETE CASCADE,
  titulo       VARCHAR(200) NOT NULL,
  descricao    TEXT,
  imagem_url   TEXT         NOT NULL,
  ia_gerada    BOOLEAN      NOT NULL DEFAULT false,
  status       VARCHAR(20)  NOT NULL DEFAULT 'rascunho',  -- 'rascunho' | 'publicado'
  created_at   TIMESTAMP    NOT NULL DEFAULT now()
)

Piece (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  look_id      UUID         NOT NULL REFERENCES Look(id) ON DELETE CASCADE,
  nome         VARCHAR(200) NOT NULL,
  loja         VARCHAR(100),
  preco        NUMERIC(10,2),
  link_compra  TEXT         NOT NULL,
  imagem_url   TEXT,
  created_at   TIMESTAMP    NOT NULL DEFAULT now()
)

Click (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_id     UUID         NOT NULL REFERENCES Piece(id) ON DELETE CASCADE,
  look_id      UUID         NOT NULL REFERENCES Look(id) ON DELETE CASCADE,
  user_agent   TEXT,
  ip_hash      VARCHAR(64),
  created_at   TIMESTAMP    NOT NULL DEFAULT now()
)

SavedLook (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID         NOT NULL REFERENCES User(id) ON DELETE CASCADE,
  look_id      UUID         NOT NULL REFERENCES Look(id) ON DELETE CASCADE,
  created_at   TIMESTAMP    NOT NULL DEFAULT now(),
  UNIQUE (user_id, look_id)
)
```

O campo `ip_hash` na entidade `Click` armazena um hash do endereço IP do
visitante em vez do IP bruto, evitando a retenção de dado pessoal desnecessário.
O campo `look_id` é mantido diretamente na entidade `Click` — ainda que
derivável via `Piece` — para permitir consultas de métricas agregadas por look
sem a necessidade de junções adicionais, o que favorece o desempenho das
consultas do painel do creator.

---

## 5.3 Principais Componentes

Esta seção descreve os módulos que compõem o sistema, sua responsabilidade
funcional e os requisitos que cada um atende.

---

### Módulo de Autenticação

O módulo de autenticação gerencia o cadastro e o login de usuários. Ao criar
uma conta, a senha é processada com bcrypt antes de ser persistida —
nenhuma senha em texto claro é armazenada no banco. No login, as credenciais
são verificadas e um token JWT é gerado com prazo de expiração configurável.
Esse token é enviado pelo frontend em todas as requisições que exigem
autenticação e validado pelo middleware da API antes de acionar qualquer
serviço protegido. O módulo cobre os requisitos RF01, RF02, RF03 e os
requisitos não funcionais RNF04, RNF05 e RNF07.

---

### Módulo de Looks

O módulo de looks concentra as operações de criação, edição, publicação e
remoção de looks. É o módulo central da plataforma em termos de lógica de
negócio: verifica se as pré-condições de publicação estão satisfeitas (RN04,
RN08), aplica o limite de publicações conforme o plano do usuário (RN07) e
persiste o estado do look como `rascunho` ou `publicado`. O feed público
retorna apenas looks com status `publicado`, paginados para atender ao
requisito de desempenho RNF10. O módulo cobre os requisitos RF05, RF10, RF11,
RF12, RF13 e RF14.

---

### Módulo de Peças

O módulo de peças gerencia os itens que compõem um look. Cada peça é associada
a um look específico e deve conter obrigatoriamente nome e link de compra
(RN05). O módulo aciona o LinkValidator antes de confirmar o cadastro de cada
peça, garantindo que links tecnicamente inválidos ou maliciosos sejam
bloqueados na entrada (RF15). Links que passam na validação técnica mas são
comercialmente inválidos permanecem sob responsabilidade do creator, conforme
estabelecido pela regra de negócio RN06.

---

### Módulo de Rastreamento de Cliques

O rastreamento de cliques é o mecanismo central de medição da north star metric
da plataforma. Toda vez que um usuário acessa um link de compra, a requisição
passa pelo ClickTracker antes do redirecionamento: o evento é registrado na
tabela `Click` com os metadados relevantes e o usuário é redirecionado para a
URL externa. Esse fluxo garante que cada clique seja contabilizado de forma
atômica — sem depender de JavaScript no cliente — e que as métricas do painel
do creator reflitam a realidade com precisão. O módulo cobre os requisitos RF07
e RF16, além da regra de negócio RN09.

---

### Integração com Google Gemini

O ImageService encapsula toda a comunicação com a Google Gemini API. Ao ser
acionado, recebe os dados do look em criação — título, tags de estilo e
descrição das peças — e constrói um prompt estruturado para a geração de uma
imagem de modelo virtual vestindo o look. A resposta da API é processada e a
URL da imagem gerada é associada ao look com o campo `ia_gerada` marcado como
`true`, permitindo que o frontend exiba o badge "IA Gerado" na tela de
detalhes do look. Em caso de falha, o serviço retorna um erro estruturado que
aciona o fluxo alternativo FA05. O módulo cobre o requisito RF17.

---

### Integração com Stripe

O StripeClient gerencia exclusivamente o ciclo de vida da assinatura Pro do
creator. O fluxo de upgrade cria uma sessão de checkout no Stripe; após o
pagamento confirmado via webhook, o campo `plano` do usuário é atualizado de
`free` para `pro` no banco de dados. Cancelamentos e inadimplências são
processados pelo mesmo mecanismo de webhook, revertendo o plano para `free`
quando necessário. O VesteAí não armazena dados de cartão nem processa
pagamentos de produtos em nenhuma circunstância — toda a transação financeira
ocorre no ambiente seguro do Stripe.

---

### Validação de Links

O LinkValidator é um componente utilitário acionado pelo módulo de peças
durante o cadastro de links de compra. Realiza duas verificações sequenciais:
primeiro, testa a acessibilidade da URL com uma requisição HTTP e verifica se
a resposta indica um destino válido; segundo, consulta o domínio de destino
contra uma lista de domínios sinalizados como maliciosos. Links que falham
em qualquer uma das verificações são rejeitados com uma mensagem de erro
identificando qual link causou o problema (FA04). O componente cobre o
requisito RF15 e operacionaliza a regra de negócio RN06.

---

## 5.4 Stack Tecnológica

As escolhas tecnológicas do VesteAí foram orientadas por três critérios
principais: adequação técnica aos requisitos do projeto, produtividade no
contexto de um time reduzido e um único desenvolvedor, e maturidade do
ecossistema para um produto web em produção. Esta seção justifica cada
escolha em relação às alternativas disponíveis.

---

### Next.js (Frontend)

O Next.js foi escolhido como framework de frontend por combinar, em uma única
solução, renderização no lado do servidor (SSR), geração estática (SSG) e
interatividade no cliente via React. Essa flexibilidade é especialmente
relevante para o VesteAí: o feed público e as páginas de look individual se
beneficiam do SSR para indexação por mecanismos de busca e carregamento rápido
sem autenticação, enquanto o editor de looks e o painel do creator operam
com estado dinâmico no cliente.

A alternativa direta seria um SPA puro com React e Vite, que entrega
interatividade equivalente mas sem renderização no servidor — o que
prejudicaria a indexabilidade do feed de looks e o tempo de carregamento
percebido pelo visitante não autenticado. O Next.js elimina essa troca ao
permitir que cada rota adote a estratégia de renderização mais adequada ao
seu perfil de acesso.

---

### FastAPI com Python (Backend)

O FastAPI foi escolhido como framework de backend pela combinação de alta
performance, tipagem estática nativa via Pydantic e geração automática de
documentação OpenAPI. A tipagem forte no contrato da API reduz erros de
integração com o frontend e facilita a validação dos dados de entrada sem
código boilerplate adicional.

Em relação ao Flask — a alternativa Python mais comum — o FastAPI oferece
suporte nativo a operações assíncronas e validação de dados integrada ao
framework, o que é relevante para operações de I/O como chamadas à Gemini API
e ao Stripe. A escolha por Python como linguagem do backend também é motivada
pela facilidade de integração com SDKs de IA, considerando que a Google AI SDK
para Python é a mais madura e documentada entre as disponíveis.

---

### PostgreSQL (Banco de Dados)

O PostgreSQL foi escolhido como banco de dados relacional pela robustez,
pelo suporte nativo a UUIDs como chave primária e pela maturidade do
ecossistema de ferramentas e bibliotecas de acesso em Python. O modelo
relacional é adequado ao domínio do VesteAí: as entidades possuem
relacionamentos bem definidos (Look → Piece → Click) e as consultas de
métricas do painel do creator se beneficiam da expressividade do SQL
para agregações.

A alternativa de um banco NoSQL como MongoDB não foi adotada porque o
esquema de dados do VesteAí é estável e fortemente relacional. A
flexibilidade de esquema do MongoDB não apresenta vantagem nesse contexto
e introduz complexidade adicional na manutenção da integridade referencial
entre as entidades.

---

### Google Gemini API (Geração de Imagem)

A Google Gemini API foi escolhida para a funcionalidade de geração de imagem
de look com modelo virtual por oferecer capacidade multimodal — geração de
imagem a partir de texto descritivo — com SDK Python oficial e documentação
ampla. A integração se encaixa no fluxo do creator como uma funcionalidade
auxiliar: o creator que não tem uma foto do look pode gerar uma imagem de
referência sem precisar sair da plataforma.

Em relação à alternativa DALL-E da OpenAI, a Gemini API foi preferida pela
integração mais direta com o ecossistema Google e pela disponibilidade de
modelos de geração de imagem com custo por chamada adequado ao volume
esperado em um MVP. A funcionalidade é apresentada ao usuário como um
auxílio à criação, não como diferencial central — o que justifica uma
escolha pragmática baseada em disponibilidade e custo operacional.

---

### Stripe (Processamento de Assinatura)

O Stripe foi escolhido para processar a assinatura Pro do creator por ser a
plataforma de pagamentos recorrentes com melhor suporte a webhooks, documentação
mais completa e SDK oficial para Python. O modelo de assinatura recorrente
(R$29/mês) é exatamente o caso de uso central do Stripe — o que simplifica
a implementação em comparação com soluções alternativas como PagSeguro ou
Mercado Pago, que têm suporte menos maduro a cobranças recorrentes
programáticas.

É importante reiterar que o Stripe é utilizado exclusivamente para a assinatura
da plataforma. A monetização dos creators — as comissões de afiliado — ocorre
fora do VesteAí, nos programas de afiliados das próprias lojas, e não envolve
nenhum fluxo financeiro dentro do sistema.

---

### JWT + bcrypt (Autenticação)

A autenticação por tokens JWT foi escolhida por ser stateless — o servidor
não precisa manter sessões em memória ou banco — o que simplifica a
arquitetura ao eliminar a necessidade de um serviço de sessões. O token
carrega os dados necessários para identificar o usuário e é validado pelo
middleware da API a cada requisição protegida.

O bcrypt foi escolhido para o hash de senhas por ser o algoritmo recomendado
para armazenamento seguro de credenciais: é adaptativo (o fator de custo pode
ser aumentado conforme o hardware evolui), resistente a ataques de força bruta
por ser computacionalmente custoso por design, e amplamente suportado nas
bibliotecas Python de segurança. Essa combinação atende diretamente aos
requisitos não funcionais RNF04 e RNF05.

---

### GitHub — Monorepo (Controle de Versão e Deploy)

O repositório do VesteAí é organizado como monorepo no GitHub, com o frontend
Next.js e o backend FastAPI no mesmo repositório. Essa organização facilita
a consistência entre as versões dos dois serviços, simplifica o gerenciamento
de dependências compartilhadas e permite que um único pull request abranja
alterações que afetam tanto o frontend quanto o backend — o que é especialmente
relevante em um projeto desenvolvido por um único desenvolvedor.

A alternativa de repositórios separados (polyrepo) introduziria overhead de
sincronização sem benefício real no contexto do MVP — os times independentes
que justificariam repositórios separados não existem nesse projeto.

---

### Resumo da Stack

| Camada | Tecnologia | Alternativa Considerada | Razão da Escolha |
|--------|-----------|------------------------|-----------------|
| Frontend | Next.js (React) | React + Vite (SPA) | SSR para feed público e indexabilidade |
| Backend | FastAPI (Python) | Flask (Python) | Tipagem nativa, async, validação integrada |
| Banco de dados | PostgreSQL | MongoDB | Esquema relacional estável, integridade referencial |
| IA | Google Gemini API | DALL-E (OpenAI) | Ecossistema Python, custo operacional do MVP |
| Pagamentos | Stripe | PagSeguro / Mercado Pago | Suporte maduro a assinaturas recorrentes |
| Autenticação | JWT + bcrypt | Sessões em banco | Stateless, sem necessidade de serviço de sessão |
| Repositório | GitHub (monorepo) | Polyrepo | Time único, sincronização simplificada |

---

# 6. Segurança e Privacidade

Esta seção descreve as medidas de segurança adotadas no VesteAí e o
tratamento dos dados pessoais dos usuários em conformidade com a Lei
Geral de Proteção de Dados (LGPD).

---

## 6.1 Autenticação e Autorização

O VesteAí utiliza autenticação baseada em tokens JWT. Após o login com
e-mail e senha, o servidor emite um token assinado com prazo de expiração
configurável. Esse token é enviado pelo frontend no header `Authorization`
em todas as requisições que exigem autenticação.

As senhas dos usuários são armazenadas exclusivamente como hash bcrypt —
nenhuma senha em texto claro é persistida ou trafegada pelo sistema. O
bcrypt é resistente a ataques de força bruta por ser computacionalmente
custoso por design.

O controle de autorização é aplicado por middleware na API: endpoints
protegidos verificam a validade do token antes de acionar qualquer serviço.
Um usuário autenticado só pode editar ou remover looks criados por ele
mesmo (RN07) — requisições que tentam acessar recursos de outro usuário
são rejeitadas com erro 403.

---

## 6.2 Segurança da Aplicação (OWASP Top 10)

As principais ameaças do OWASP Top 10 relevantes para o VesteAí e as
medidas adotadas para mitigá-las:

| Ameaça | Medida adotada |
|--------|---------------|
| Broken Access Control | Middleware de autenticação JWT em todos os endpoints protegidos; verificação de propriedade antes de editar ou remover recursos |
| Cryptographic Failures | Senhas armazenadas com bcrypt; comunicação exclusivamente via HTTPS; IPs armazenados apenas como hash |
| Injection | Queries executadas via SQLAlchemy com parâmetros — sem concatenação de SQL; validação de entrada via Pydantic no FastAPI |
| Insecure Design | Separação entre frontend e backend; credenciais de API externas (Gemini, Stripe) acessadas exclusivamente pelo backend |
| Security Misconfiguration | Variáveis sensíveis (chaves de API, secret JWT, credenciais do banco) gerenciadas via variáveis de ambiente, nunca em código |
| Vulnerable Components | Dependências gerenciadas via `requirements.txt` e `package.json` com versões fixas |
| Server-Side Request Forgery (SSRF) | LinkValidator valida e restringe domínios de destino antes de aceitar links de compra |

---

## 6.3 Proteção de Dados em Trânsito e em Repouso

Toda a comunicação entre cliente e servidor ocorre exclusivamente via
HTTPS — requisito não funcional RNF06. Isso garante que tokens JWT,
credenciais de login e dados do usuário não trafeguem em texto claro
na rede.

O banco de dados PostgreSQL é acessado exclusivamente pelo backend via
conexão autenticada. Nenhum dado do banco é exposto diretamente ao
frontend ou a sistemas externos.

---

## 6.4 Privacidade e LGPD

### Dados coletados

O VesteAí coleta apenas os dados necessários para o funcionamento da
plataforma:

| Dado | Finalidade | Base legal (LGPD) |
|------|-----------|-------------------|
| Nome e e-mail | Identificação e autenticação do usuário | Execução de contrato (Art. 7°, V) |
| Senha (hash bcrypt) | Autenticação segura | Execução de contrato (Art. 7°, V) |
| Avatar e bio | Personalização do perfil público | Consentimento (Art. 7°, I) |
| Looks e peças publicados | Conteúdo da plataforma | Execução de contrato (Art. 7°, V) |
| Cliques em links (com IP hash) | Métricas de desempenho para o creator | Legítimo interesse (Art. 7°, IX) |

O VesteAí **não coleta** dados de cartão de crédito, dados bancários nem
informações de compra — todas as transações financeiras ocorrem nas lojas
externas ou no ambiente seguro do Stripe.

### Armazenamento

Os dados são armazenados no PostgreSQL hospedado em ambiente de produção
com acesso restrito. O endereço IP dos visitantes que clicam em links de
compra é armazenado exclusivamente como hash SHA-256 — o IP bruto nunca
é persistido, minimizando a retenção de dado pessoal identificável.

### Direitos do titular

O usuário pode, a qualquer momento:

- **Acessar** seus dados exportando o conteúdo do seu perfil
- **Corrigir** nome, e-mail, avatar e bio nas configurações de perfil
- **Excluir** sua conta, o que remove permanentemente todos os seus dados
  pessoais e looks publicados do banco de dados (exclusão em cascata via
  `ON DELETE CASCADE` no esquema relacional)

Solicitações de direitos do titular podem ser feitas diretamente pelo
e-mail de contato da plataforma. O prazo de resposta é de até 15 dias
corridos, conforme previsto na LGPD.

### Retenção de dados

Os dados do usuário são mantidos enquanto a conta estiver ativa. Após a
exclusão da conta, todos os dados pessoais são removidos imediatamente.
Registros de cliques anonimizados (sem vínculo com usuário identificável)
podem ser mantidos para fins estatísticos agregados.

---

# 7. Planejamento do Projeto

O desenvolvimento do VesteAí está dividido em duas fases distintas,
separadas por semestre letivo. O primeiro semestre de 2026 é dedicado
à documentação, definição arquitetural e aprovação pelos professores
orientadores. O desenvolvimento da aplicação ocorre integralmente no
segundo semestre de 2026, com entrega e apresentação no Demo Day.

---

## 7.1 Fase 1 — Documentação e Aprovação (1º Semestre 2026)

| Marco | Descrição | Período |
|-------|-----------|---------|
| M1 | Definição do produto, pesquisa de usuários e benchmark | Março 2026 |
| M2 | Engenharia de requisitos (RFs, RNFs, regras de negócio, personas) | Abril 2026 |
| M3 | Fluxos do sistema, wireframes e mockups de UX | Abril 2026 |
| M4 | Arquitetura do sistema (C4, modelo de dados, stack tecnológica) | Maio 2026 |
| M5 | Segurança, privacidade e planejamento do projeto | Maio 2026 |
| M6 | Entrega da RFC e aprovação pelos professores orientadores | Junho 2026 |

---

## 7.2 Fase 2 — Desenvolvimento (2º Semestre 2026)

| Marco | Descrição | Período |
|-------|-----------|---------|
| M7 | Setup do monorepo, ambiente de desenvolvimento e CI/CD | Agosto 2026 |
| M8 | Backend: autenticação, modelo de dados e CRUD de looks | Agosto 2026 |
| M9 | Backend: rastreamento de cliques, validação de links e integração Gemini | Setembro 2026 |
| M10 | Frontend: feed de looks, tela de detalhes e carrinho | Setembro 2026 |
| M11 | Frontend: editor de looks, painel do creator e autenticação | Outubro 2026 |
| M12 | Integração Stripe (assinatura Pro) e testes de integração | Outubro 2026 |
| M13 | Testes unitários (cobertura mínima 70% no backend) e correções | Novembro 2026 |
| M14 | Deploy em produção, validação com usuários reais e ajustes finais | Novembro 2026 |
| M15 | Demo Day — apresentação do produto funcional | Dezembro 2026 |

---

## 7.3 Critérios de Conclusão

O projeto será considerado concluído quando os seguintes critérios
forem atendidos simultaneamente:

- RFC aprovada pelos professores orientadores até o fim do 1º semestre
- Todos os requisitos funcionais RF01–RF17 implementados e verificados
- Cobertura mínima de 70% de testes unitários no backend
- Aplicação acessível publicamente via URL estável em produção
- Pelo menos 5 looks publicados por criadores reais antes do Demo Day
- Pelo menos 1 clique em link de compra registrado por look publicado