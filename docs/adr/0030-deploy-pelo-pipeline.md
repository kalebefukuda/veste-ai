# ADR-0030 — O deploy sai do pipeline: o front pelo Vercel CLI, a API pelo ECS

Data: 07/11/2026 · Status: aceita

## Contexto

O front está na Vercel, com autorização do orientador registrada em ata (ADR-0002). A
integração da Vercel com o GitHub, porém, publicava sozinha: o `vercel.json` desligava só a
`main`, e todo envio de outra branch virava uma prévia sem passar pelo CI. A linha Web Apps
não conta deploy automático da plataforma como CD, e o `CLAUDE.md` exige deploy só pelo
pipeline. A API não tinha deploy nenhum: faltava o "D" do CI/CD.

Mover o front para o ECS, ao lado da API, foi considerado e descartado: seria mais um
serviço para manter e pagar.

## Decisão

**O deploy é uma etapa do mesmo `ci.yml`**, depois dos jobs de checagem. Nada é publicado
com o CI vermelho, e pull request nunca publica.

- **`dev` → homologação.** O front vira uma prévia na Vercel, no ambiente `staging` do
  GitHub. Ele aponta para a API de produção, porque só existe um backend.
- **`main` → produção**, no ambiente `production` do GitHub, que exige aprovação de uma
  pessoa antes de seguir. Primeiro a API, depois o front.

**A API** entra na AWS por OIDC, pela role `vesteai-github-actions`, que só aceita a `main`.
O job:

1. envia ao ECR uma imagem com a tag do commit;
2. registra uma revisão da task com essa imagem;
3. roda as migrations numa task avulsa, com a revisão nova;
4. troca o service e espera ele estabilizar;
5. confere o `/health`.

Se a migration falhar, o service continua na versão anterior. A role ganhou três
permissões: `DescribeTaskDefinition`, `RunTask` (só a família da API e só neste cluster) e
`DescribeTasks`. O job só roda quando a variável `API_DEPLOY_ENABLED` vale `true`; enquanto
o runtime da AWS estiver desligado, ele fica pulado e o front segue sozinho.

**O front** é publicado pelo Vercel CLI, com um token guardado nos segredos do GitHub. A
integração Git da Vercel fica desligada para todas as branches.

## Consequências

Toda publicação deixa rastro: o commit, a execução no Actions e quem aprovou.

Na `main` a aprovação acontece duas vezes, uma para a API e outra para o front, porque cada
job pede o ambiente `production`.

A homologação usa o banco de produção: um teste na prévia grava dado de verdade. Isso é
aceito enquanto o sistema não tem usuário real.

Antes do primeiro deploy é preciso:

- o segredo `VERCEL_TOKEN`;
- as variáveis `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `AWS_DEPLOY_ROLE_ARN`, `API_URL` e
  `API_DEPLOY_ENABLED`;
- os ambientes `staging` e `production`, com aprovador no `production`;
- o `terraform apply` das permissões novas da role.

Para voltar uma versão da API, basta apontar o service para a revisão anterior da task. A
imagem antiga continua no ECR. No front, basta promover um deploy anterior na Vercel ou
rodar o pipeline de novo a partir de um commit anterior.
