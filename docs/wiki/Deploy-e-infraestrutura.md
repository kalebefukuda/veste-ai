# Deploy e infraestrutura

## O desenho

| Peça | Onde | Observação |
|---|---|---|
| Frontend | **Vercel** | autorizado em ata pelo orientador. Quem publica é o pipeline: a integração Git da Vercel está desligada para todas as branches em `frontend/vercel.json` — versionado, e não um toggle no painel, para a decisão aparecer no diff |
| API | **AWS ECS Fargate** (`us-east-2`, Ohio) | atrás de ALB, com certificado do ACM. O TLS termina no ALB |
| Banco | **AWS RDS PostgreSQL** `db.t4g.micro` | sub-rede privada, sem IP público. O security group aceita só o do Fargate |
| Imagens de look | **AWS S3** | bucket privado com *Block Public Access*, servido por URL pré-assinada |
| Segredos | **AWS Secrets Manager** | referenciados no campo `secrets` da task definition |
| Provisionamento | **Terraform**, em `infra/` | mudança de infra entra por PR |

A Railway foi recusada pelo orientador e saiu do plano; o porquê da AWS gerenciada e o
que foi descartado no caminho está em [[ADRs]], nos ADR-0002 e ADR-0017.

## O pipeline

`.github/workflows/ci.yml` roda em todo push e PR para `dev` e `main`. Primeiro as
checagens:

| Job | O que faz |
|---|---|
| **backend** | `ruff check` e `pytest` com cobertura, contra um **Postgres 16 de verdade** — não um dublê |
| **frontend** | `npm run lint`, `npm run test:coverage` e `npm run build` (que também faz o typecheck) |
| **infra** | `terraform fmt -check`, `init -backend=false` e `validate` |
| **sonarcloud** | análise estática, lendo os relatórios de cobertura dos dois jobs anteriores |

`.github/workflows/docs.yml` publica esta wiki a partir de `docs/wiki/` quando um merge
entra na `dev`.

Duas coisas deliberadamente **fora** do CI:

- **`terraform plan`** exige credencial. O job roda só o que não exige. O `plan` entra
  quando o pipeline ganhar uma credencial só de leitura.
- **`terraform apply`** é sempre manual e com aval, porque cria recurso que cobra.

O gate de cobertura (`--cov-fail-under`) é uma **catraca**: trava o nível já medido para
só disparar se alguém baixar a cobertura. Sobe a cada sprint até as metas da disciplina
— 75% no backend e 25% no frontend — e nunca desce. O valor vive só no workflow, para
não precisar ser atualizado em dois arquivos.

As actions estão presas por **SHA de commit**, não por tag: tag é mutável, e uma tag
recriada num repositório de terceiro executaria código diferente com o mesmo nome.

### O deploy

Depois das checagens verdes, e só em push (pull request nunca publica), vem o deploy. O
porquê está no
[ADR-0030](https://github.com/kalebefukuda/veste-ai/blob/dev/docs/adr/0030-deploy-pelo-pipeline.md).

| Job | Quando | O que faz |
|---|---|---|
| **deploy-web-staging** | push na `dev` | publica o front como prévia na Vercel e aponta `staging.vesteai.site` para ela (ambiente `staging`) |
| **deploy-api-production** | push na `main`, com aprovação | imagem com a tag do commit no ECR → nova revisão da task → migrations numa task avulsa → troca do service → `/health` |
| **deploy-web-production** | push na `main`, depois da API, com aprovação | publica o front em produção na Vercel |

- **Aprovação:** o ambiente `production` do GitHub segura os dois jobs de produção até
  alguém aprovar na tela do Actions.
- **AWS por chave do ambiente:** a conta proíbe provedor OIDC, então a API entra pelo usuário
  `vesteai-github-deploy`. A chave fica só no ambiente `production`, que aceita só a `main`
  ([ADR-0031](https://github.com/kalebefukuda/veste-ai/blob/dev/docs/adr/0031-conta-nova-em-ohio-com-chave-de-deploy.md)).
- **Vercel pelo CLI:** o token fica nos segredos do GitHub.
- **O job da API fica pulado** enquanto a variável `API_DEPLOY_ENABLED` não for `true`, o
  que vale enquanto o runtime da AWS estiver desligado.

Para ligar, configure no repositório:

| Onde | Nome | Valor |
|---|---|---|
| Secret | `VERCEL_TOKEN` | token criado na Vercel |
| Variable | `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` | identificadores do projeto, em `.vercel/project.json` depois de um `vercel link` |
| Secret do ambiente `production` | `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | chave do usuário `terraform output github_deploy_user`, criada no console e trocada a cada 90 dias |
| Variable | `API_URL` | `https://api.vesteai.site` |
| Variable | `API_DEPLOY_ENABLED` | `true` quando o runtime estiver no ar |
| Environment | `staging` e `production` | `production` com aprovador obrigatório e restrito à `main` |
| Vercel e DNS | `staging.vesteai.site` | domínio no projeto da Vercel, com o CNAME que ela indicar criado na Hostinger |

Para voltar uma versão da API, aponte o service para a revisão anterior da task. A imagem
antiga continua no ECR. Nenhum passo do desenho usa SSH ou FTP em ponto nenhum.

## Monitoramento

A API expõe métricas no formato do Prometheus na porta 9100, que nenhuma regra de rede
abre. Na AWS, um Prometheus em modo agente roda como segundo container da task, lê essa
porta pela rede da própria task e envia tudo ao **Grafana Cloud**, onde ficam o painel e
os alertas. O porquê está no
[ADR-0029](https://github.com/kalebefukuda/veste-ai/blob/dev/docs/adr/0029-monitoramento-com-prometheus-e-grafana-cloud.md).

O painel é o arquivo `infra/monitoring/grafana/dashboards/vesteai.json`, o mesmo do
ambiente local. Para ligar o envio, preencha `grafana_cloud_remote_write_url` e
`grafana_cloud_user` no Terraform e cole o token no segredo
`vesteai/grafana-cloud-token-*`. Sem a URL, a task sobe sem o Prometheus.

## Variáveis de ambiente

Todas estão em
[`.env.example`](https://github.com/kalebefukuda/veste-ai/blob/dev/.env.example).
O que muda por ambiente é **onde o valor mora**:

| Variável | O que é | Onde mora em produção |
|---|---|---|
| `DATABASE_URL` | conexão com o Postgres | Secrets Manager → campo `secrets` |
| `JWT_SECRET` | assinatura do token | Secrets Manager → campo `secrets` |
| `BREVO_API_KEY` | envio de e-mail transacional | Secrets Manager → campo `secrets` |
| `FRONTEND_ORIGIN` | origem única liberada no CORS | task definition → campo `environment` |
| `ENV` | liga o HSTS; fora de produção ele não sai | task definition → `environment`, fixo em `production` |
| `FRONTEND_RESET_URL` | link do e-mail de recuperação de senha | task definition → campo `environment` |
| `EMAIL_SENDER` | remetente do e-mail | **não é injetada** — o padrão da aplicação já é `nao-responda@vesteai.site` |
| `NEXT_PUBLIC_API_URL` | endereço da API para o browser | variável da Vercel |
| `METRICS_PORT` | porta interna das métricas; vazia não abre nada | task definition → `environment`, fixo em `9100` |
| `METRICS_ADDR` | endereço em que essa porta escuta | **não é injetada** — o padrão `127.0.0.1` basta, o Prometheus lê pelo `localhost` da task |

> Na task definition, **`environment` é texto plano** — aparece no console para quem
> tiver leitura na conta. Credencial vai em `secrets`, sem exceção. A única chave
> estática da AWS é a do pipeline, guardada no ambiente `production` do GitHub, nunca no
> repositório nem no estado do Terraform. `NEXT_PUBLIC_*` é público por
> definição — segredo com esse prefixo é segredo vazado.

Sem `BREVO_API_KEY` o cliente de e-mail registra um aviso e o token de reset é criado
do mesmo jeito, então o fluxo é testável ponta a ponta sem provedor configurado.

`FRONTEND_ORIGIN` e `FRONTEND_RESET_URL` têm padrão de desenvolvimento (`localhost`), e
esquecer de preenchê-las falharia **calado** em produção: o e-mail sairia, entregaria, e
o link não levaria a lugar nenhum. Por isso a task definition tem duas `precondition` —
com `enable_runtime = true`, o `apply` **recusa** enquanto qualquer uma das duas apontar
para localhost.

## Primeiro provisionamento

A ordem, o que cada passo depende e a variável `enable_runtime` — que decide se a camada
cobrada por hora existe — estão no runbook em
[`infra/README.md`](https://github.com/kalebefukuda/veste-ai/blob/dev/infra/README.md).

O estado do Terraform mora num bucket S3 privado, criptografado, versionado e com trava,
criado por `infra/bootstrap/` antes de tudo — a decisão está no ADR-0026.

Falta decidir **antes** do primeiro `apply` o **domínio**. Ele destrava três coisas de uma
vez: o certificado do ACM, o remetente verificado do e-mail e o domínio próprio como
diferencial da linha.
