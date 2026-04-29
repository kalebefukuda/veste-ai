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
## 2.1 Personas
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