# Infraestrutura

Terraform que provisiona o backend do VesteAí na AWS. O desenho e o porquê de cada
escolha estão em [`docs/adr/0002-hospedagem.md`](../docs/adr/0002-hospedagem.md) e
[`docs/adr/0017-subrede-publica.md`](../docs/adr/0017-subrede-publica.md).

> `terraform apply` cria recurso que **cobra**. Ele é sempre manual e com aval — nunca
> roda no pipeline. O CI executa apenas `fmt`, `init` e `validate`.

## Comandos

```bash
terraform init -backend=false   # o que o CI roda; não precisa de credencial
terraform fmt -check -recursive
terraform validate

terraform plan                  # precisa de credencial; não cria nada
terraform apply                 # cria recurso que cobra
```

## A variável que controla o custo

`enable_runtime` decide se a camada cobrada por hora existe.

| | `false` (padrão) | `true` |
|---|---|---|
| VPC, sub-redes, security groups | ✅ | ✅ |
| ECR, S3, Secrets Manager, IAM | ✅ | ✅ |
| ALB, RDS, service Fargate | — | ✅ |
| Custo aproximado | ~US$ 1,60/mês | ~US$ 57/mês |

Desligar não destrói o que é lento de reconstruir: o endpoint do banco, o certificado
validado e as imagens do ECR continuam de pé.

## Ordem do primeiro provisionamento

Cada passo depende do anterior.

**1. Decidir onde mora o estado.** Hoje ele é local e está no `.gitignore`. Antes do
primeiro `apply`, escolher um backend remoto — perder o arquivo de estado significa
recurso órfão consumindo crédito sem ninguém enxergar.

**2. Aplicar a camada gratuita.** Com `enable_runtime = false`, cria VPC, ECR, S3,
segredos e as roles. Nada cobra por hora.

**3. Empurrar a primeira imagem para o ECR.** O ECR nasce vazio, e o service não
estabiliza sem imagem para puxar. A tag precisa casar com `api_image_tag`, que por
padrão é `bootstrap`:

```bash
aws ecr get-login-password | docker login --username AWS --password-stdin <conta>.dkr.ecr.<região>.amazonaws.com
docker build -t <repo>:bootstrap ../backend
docker push <repo>:bootstrap
```

Depois do primeiro deploy o pipeline assume: ele empurra a imagem marcada com o SHA do
commit e registra uma revisão nova da task definition. Por isso o service ignora
mudanças em `task_definition` — senão o Terraform desfaria o deploy.

**4. Validar o certificado, se houver domínio.** Com `domain_name` preenchido, o
`apply` cria o certificado e **para**, esperando a validação por DNS. Rode
`terraform output acm_validation_records`, crie os registros no seu provedor de DNS, e
o `apply` conclui sozinho. Sem domínio, o ALB serve HTTP e este passo não existe.

**5. Ligar o runtime.** Com `enable_runtime = true`, sobem ALB, RDS e o service.

## O que este Terraform não faz

- Não cria a zona no **Route 53** — a decisão de onde fica o DNS está em aberto.
- Não executa **migrations**; isso é passo do pipeline.
- Não configura o **backend de estado**, pelo motivo do passo 1.
