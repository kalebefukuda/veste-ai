# ADR-0026 — O estado do Terraform mora num bucket S3 com trava

Data: 27/10/2026 · Status: aceita

## Contexto

O Terraform guarda num arquivo, o estado, o mapa entre o código de `infra/` e o que
existe de fato na AWS. Sem bloco `backend`, esse arquivo nasce no disco de quem roda o
`apply`. Duas coisas tornam isso inaceitável aqui:

1. **Perder o arquivo deixa a infraestrutura órfã.** O Terraform deixa de saber o que
   criou: os recursos continuam de pé e cobrando, e o próximo `apply` tenta criar tudo
   de novo. Com o crédito contado do ADR-0002, recurso órfão é dinheiro que some sem
   ninguém enxergar.
2. **O estado guarda credencial em texto puro.** A senha do banco e o segredo do JWT
   são gerados por `random_password` em `secrets.tf`, e o valor gerado fica no estado.
   Quem lê o arquivo lê as duas.

O repositório é público, então versionar o estado está fora de questão — o
`.gitignore` já barra `*.tfstate`.

## Alternativas consideradas

**A — Estado local.** Zero configuração. O arquivo fica num disco só, sem cópia e sem
histórico, e leva as duas credenciais para onde o notebook for.

**B — S3 com trava em DynamoDB.** O desenho clássico. A HashiCorp marcou essa trava
como obsoleta desde que o backend S3 passou a travar com um arquivo no próprio bucket:
seria uma tabela a mais para um mecanismo de saída.

**C — HCP Terraform.** Estado e trava gerenciados, mas numa conta fora da AWS: mais um
fornecedor com acesso às credenciais do estado, e mais uma conta para manter.

**D — S3 com trava nativa (`use_lockfile`).** Um bucket só, nenhum serviço novo.

## Decisão

**D.**

**Bucket próprio, criado por `infra/bootstrap/`:** privado, com bloqueio de acesso
público, criptografado e versionado. `prevent_destroy` impede que um `destroy`
descuidado leve o estado junto.

**O bucket não é gerenciado pelo Terraform que ele guarda.** O `init` de `infra/`
precisa do bucket antes de existir qualquer estado. O `bootstrap/` resolve isso com
estado local — e ali o estado local é aceitável, porque não carrega segredo nenhum: só
descreve o próprio bucket, que pode ser reimportado se o arquivo se perder.

**Trava nativa.** Dois `apply` ao mesmo tempo — dois terminais, ou o pipeline um dia —
esbarram no arquivo de trava em vez de gravar um por cima do outro.

**Versionamento.** Cada `apply` vira uma versão do objeto; um estado corrompido volta
para a anterior.

**O nome é gerado, não fixo.** `bucket_prefix` sorteia o sufixo, e o nome entra no
`init` pela saída do bootstrap. Nome de bucket é global: um nome previsível num
repositório público poderia ser reservado por outra conta antes do primeiro `apply`.

**SSE-S3, e não uma chave KMS própria.** A chave própria separaria quem lê o bucket de
quem decifra o estado. Com uma pessoa só operando a conta, essa separação não protege
ninguém, e a chave cobra por mês.

## Consequências

O `init` de `infra/` passa a exigir o nome do bucket:

```bash
terraform init -backend-config="bucket=$(terraform -chdir=bootstrap output -raw bucket)"
```

O CI não muda de comportamento: ele roda `init -backend=false`, que não toca o
backend, e passa a validar o `bootstrap/` também.

O primeiro provisionamento ganha um passo antes de tudo — aplicar o `bootstrap/`. É uma
vez só.

**Ler o bucket é ler as credenciais.** Quem alcança o estado alcança a senha do banco e
o segredo do JWT. Hoje só a identidade de quem opera a conta chega nele: a role do
pipeline não tem permissão de S3, porque o pipeline não roda `plan` nem `apply`, e a
role da task só alcança o bucket de imagens. Se um dia o pipeline passar a rodar
`plan`, a permissão nova tem de ser só de leitura e só neste bucket.

O backend fixa `sa-east-1` no código, porque bloco de backend não aceita variável.
Trocar de região exige mexer ali e em `bootstrap/` além de `variables.tf`.

O estado do bootstrap fica local, em `infra/bootstrap/terraform.tfstate`, fora do git.
Perdê-lo não perde nada que importe: o bucket continua lá, e `terraform import` o
devolve ao estado.
