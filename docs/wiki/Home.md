# VesteAí

> ⚠️ Esta wiki é **gerada** a partir de `docs/wiki/` no repositório principal. Editar
> pela interface do GitHub não serve: o próximo sync sobrescreve. Abra um PR alterando
> `docs/wiki/`.

Plataforma web de curadoria de looks com links de compra centralizados. O **creator**
monta um look, adiciona cada peça com o respectivo link de compra e publica; o
**consumer** navega pelo feed, junta peças de vários looks num carrinho e é
redirecionado para as lojas — com o clique registrado para alimentar as métricas do
creator. A transação acontece na loja externa: o VesteAí não vende, não processa
pagamento de produto e não mantém catálogo próprio.

TCC de Engenharia de Software — Católica SC, 8º semestre, linha Web App.
Autor: Kalebe Fukuda de Oliveira. Entrega: 30/11/2026.

## Páginas

| Página | O que tem |
|---|---|
| [[RFC-VesteAi]] | a proposta aprovada: motivação, requisitos (RF01–RF17, RN01–RN09), modelagem, arquitetura e os diagramas C4 |
| [[Como-rodar-localmente]] | subir o banco, a API e o frontend, rodar as migrations e a suíte de testes |
| [[Deploy-e-infraestrutura]] | o desenho na AWS, o pipeline, as variáveis de ambiente e a ordem do primeiro provisionamento |
| [[ADRs]] | índice das decisões que fecharam uma porta, gerado a partir de `docs/adr/` |

## Estado do projeto

O que está no ar e o que ainda não está:

| | Estado |
|---|---|
| Autenticação (RF01–RF04) | registro, login, rota protegida, recuperação de senha e perfil — entregues, com testes |
| Envio de e-mail | o fluxo de recuperação está pronto e testado, mas **não envia**: depende de remetente verificado, que depende do domínio |
| Looks, peças e feed (RF05–RF17) | não implementados |
| Pipeline | CI completo — lint, testes com cobertura em Postgres real, Terraform e análise estática. O job de deploy ainda não existe |
| Infraestrutura | escrita em Terraform e validada no CI. **Nada aplicado** — `apply` cria recurso que cobra |
| Ambiente público | ainda não existe. Quando existir, o link entra aqui |

O estado medido de cada push está nos [runs do CI](https://github.com/kalebefukuda/veste-ai/actions)
e a análise estática em [SonarCloud](https://sonarcloud.io/project/overview?id=kalebefukuda_veste-ai).

## Como contribuir

Padrão de branch, de commit e o que rodar antes de abrir PR estão em
[CONTRIBUTING.md](https://github.com/kalebefukuda/veste-ai/blob/dev/CONTRIBUTING.md).
As regras de arquitetura que um PR precisa respeitar estão em
[CLAUDE.md](https://github.com/kalebefukuda/veste-ai/blob/dev/CLAUDE.md).
