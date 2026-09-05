# Deploy e infraestrutura

## O desenho

| Peça | Onde | Observação |
|---|---|---|
| Frontend | **Vercel** | autorizado em ata pelo orientador. O deploy de produção pela integração Git está desligado em `frontend/vercel.json` — versionado, e não um toggle no painel, para a decisão aparecer no diff |
| API | **AWS ECS Fargate** (`sa-east-1`) | atrás de ALB, com certificado do ACM. O TLS termina no ALB |
| Banco | **AWS RDS PostgreSQL** `db.t4g.micro` | sub-rede privada, sem IP público. O security group aceita só o do Fargate |
| Imagens de look | **AWS S3** | bucket privado com *Block Public Access*, servido por URL pré-assinada |
| Segredos | **AWS Secrets Manager** | referenciados no campo `secrets` da task definition |
| Provisionamento | **Terraform**, em `infra/` | mudança de infra entra por PR |

A Railway foi recusada pelo orientador e saiu do plano; o porquê da AWS gerenciada e o
que foi descartado no caminho está em [[ADRs]], nos ADR-0002 e ADR-0017.

## O pipeline

`.github/workflows/ci.yml` roda em todo push e PR para `dev` e `main`, com quatro jobs:

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
  junto com a role de OIDC.
- **`terraform apply`** é sempre manual e com aval, porque cria recurso que cobra.

O gate de cobertura (`--cov-fail-under`) é uma **catraca**: trava o nível já medido para
só disparar se alguém baixar a cobertura. Sobe a cada sprint até as metas da disciplina
— 75% no backend e 25% no frontend — e nunca desce. O valor vive só no workflow, para
não precisar ser atualizado em dois arquivos.

As actions estão presas por **SHA de commit**, não por tag: tag é mutável, e uma tag
recriada num repositório de terceiro executaria código diferente com o mesmo nome.

### O que ainda não existe

O **D** do CI/CD. O job que constrói a imagem, empurra para o ECR e pede novo
deployment ao ECS depende da role de OIDC, que depende do primeiro `apply`. Nenhum
passo do desenho usa SSH ou FTP em ponto nenhum.

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
| `FRONTEND_RESET_URL` | link do e-mail de recuperação de senha | task definition → campo `environment` |
| `EMAIL_SENDER` | remetente do e-mail | **não é injetada** — o padrão da aplicação já é `nao-responda@vesteai.site` |
| `NEXT_PUBLIC_API_URL` | endereço da API para o browser | variável da Vercel |

> Na task definition, **`environment` é texto plano** — aparece no console para quem
> tiver leitura na conta. Credencial vai em `secrets`, sem exceção. E nenhuma chave
> estática da AWS entra nos secrets do repositório: o CI autentica por **OIDC com role
> assumida**, cuja credencial expira em minutos. `NEXT_PUBLIC_*` é público por
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

Duas coisas a decidir **antes** do primeiro `apply`:

1. **Onde mora o estado do Terraform.** Hoje é local e está no `.gitignore`. Perder o
   arquivo de estado significa recurso órfão consumindo crédito sem ninguém enxergar.
2. **O domínio.** Ele destrava três coisas de uma vez: o certificado do ACM, o
   remetente verificado do e-mail e o domínio próprio como diferencial da linha.
