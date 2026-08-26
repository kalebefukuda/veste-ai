# ADR-0002 — Hospedagem: AWS gerenciada no lugar da Railway

Data: 26/08/2026 · Status: aceita

## Contexto

A RFC v1.0 previa backend e frontend numa instância **EC2 `t2.micro`** com **RDS
`db.t3.micro`**, ambos provisionados à mão pelo console, e o deploy descrito como
*"conecta via SSH na instância EC2 e executa `docker compose up -d`"*.

Três problemas com esse desenho:

1. **O deploy por SSH é item de reprovação direta.** A linha Web App veda *"deploy
   manual via SSH ou FTP"*. A RFC até afirma que não usa deploy manual, mas o
   mecanismo descrito é literalmente SSH — a defesa depende de explicar, e
   explicação que depende de quem lê é risco.
2. **Uma `t2.micro` de 1 GB não sustenta** Next.js em SSR, FastAPI, Prometheus e
   Grafana ao mesmo tempo. E administrar o sistema operacional — patch, disco,
   serviço travado — é trabalho que não vira nota e que derruba o projeto se falhar
   numa terça de novembro. *Projeto fora do ar é reprovação direta.*
3. **Ambiente criado à mão não se reproduz.** Sem infraestrutura em código não há
   como derrubar e subir de novo idêntico — e é essa capacidade que torna viável a
   estratégia de custo descrita adiante.

Em 12/08/2026 a decisão foi alterada para **Vercel (frontend) + Railway (backend e
banco)**. Em **25/08/2026 o professor recusou a Railway**, e essa recusa é o que
força este registro.

A restrição que a substituta precisa satisfazer é específica. O item a evitar da
linha Web App não é "usar nuvem": é *"serviços de cloud que ocultam infraestrutura e
automação de deploy **sem domínio técnico sobre o ambiente**"*. A pergunta, portanto,
não é qual plataforma é mais fácil — é qual delas deixa a infraestrutura **explícita
e revisável**.

## Alternativas consideradas

**A — Railway.** Ergonomia excelente e o menor custo de tempo da Sprint 1.
**Recusada pelo professor**, o que encerra a avaliação técnica: é o fato que gerou
esta decisão, não uma opção que perdeu no mérito.

**B — AWS App Runner.** Seria o caminho mais curto para "container gerenciado" e
manteria a ergonomia que a Railway tinha. **Não é ofertado em `sa-east-1`** — a issue
de roadmap está aberta desde 2022. A verificação da região derrubou a recomendação
antes de ela virar plano.

**C — AWS EC2 com deploy automatizado (CodeDeploy ou SSM).** Viável e **não proibida**
— convém registrar isso porque houve confusão no caminho: a disciplina veda o *deploy
manual*, não a EC2. Descartada por **custo de manutenção e risco de indisponibilidade**:
administrar SO é trabalho recorrente que não produz evidência avaliável, e uma máquina
que trava perto da entrega custa o TCC. É mais barata em dólar (~$10/mês) e mais cara
em horas.

**D — Supabase.** Descartada de imediato: é item 🚫 explícito do playbook —
*"banco, autenticação, storage e APIs automáticas sem controle sobre a arquitetura"*.

**E — AWS ECS Fargate com Terraform.** Custo em dólar maior que a EC2 e a Sprint 1
inteira gasta em provisionamento. Em troca, elimina a administração de sistema
operacional e expõe toda a infraestrutura em código versionado — exatamente o oposto
do que o item "sem domínio técnico sobre o ambiente" pune.

## Decisão

**E.** O desenho vigente:

| Camada | Escolha |
|---|---|
| Frontend | **Vercel** — autorizado pelo professor e **registrado em ata** |
| Backend | **ECS Fargate** (`sa-east-1`), atrás de **ALB** com certificado **ACM** |
| Banco | **RDS PostgreSQL `db.t4g.micro`**, em sub-rede privada, sem IP público |
| Imagens | **S3**, bucket privado, acesso por URL pré-assinada |
| Segredos | **Secrets Manager**, no campo `secrets` da task definition — nunca em `environment` |
| Infraestrutura | **Terraform versionado** no repositório |
| Deploy | **GitHub Actions**: build → **ECR** → `aws ecs update-service --force-new-deployment` |
| Autenticação do CI | **OIDC com role assumida** — nenhuma chave estática da AWS no repositório |

O deploy **não passa por SSH em ponto nenhum**: quem publica é o Actions, pela API da
AWS. Não há porta 22 aberta, não há chave privada em secret, não há sessão humana no
caminho. O item de reprovação some por construção, não por argumentação.

## Consequências

**O que fica mais fácil**

- A administração de sistema operacional desaparece: no Fargate não há servidor seu
  para atualizar, e o RDS é operado pela AWS.
- O HTTPS passa a ser automático — o ACM emite e renova sozinho, instalado no ALB.
  Sem cron de renovação, sem certificado vencido de madrugada.
- A infraestrutura vira artefato revisável. `terraform plan` roda no PR e mostra o que
  mudaria, o que é o registro de decisão técnica mais forte que o projeto tem.
- `destroy` e `apply` reconstroem o mesmo desenho, e é isso que viabiliza a estratégia
  de três fases: subir e provar agora, derrubar durante o desenvolvimento, religar
  perto da avaliação. Sem reprodutibilidade essa estratégia não existiria.

**O que passa a custar caro**

- **O crédito é finito e já contado.** A infraestrutura ligada custa ~US$ 57/mês
  estimados, e há **US$ 120** disponíveis — cerca de 2,1 meses. Ligar tudo hoje e
  deixar rodando **não chega em novembro**, e a aplicação precisa estar no ar até a
  divulgação das notas em dezembro.
- **O ALB não escala para zero.** É a peça mais cara (~US$ 22/mês) e roda 24/7; não
  existe ALB meio ligado. Junto com Fargate e RDS, os três somam quase todo o custo.
- **A Sprint 1 inteira vai em provisionamento** — VPC, sub-redes, security groups,
  ALB, ECS, RDS, ECR, Secrets Manager e a role de OIDC.
- **`terraform plan` não pega tudo.** Permissão de IAM faltando, quota, validação de
  ACM, health check do ALB e autenticação do ECR só aparecem no `apply`. Por isso a
  Fase 1 exige um `apply` real, não um plano verde.
- **Religar não é instantâneo.** Voltar da Fase 2 exige `apply`, ACM já validado e
  health check verde — ensaiar com folga, nunca na véspera da avaliação.

**O que fica em dívida**

- **A Vercel continua na lista "o que deve ser evitado"**, e é a autorização em ata
  que responde por esse item. Ela precisa estar **escrita**, não apenas dita, e pode
  ainda assim pesar na elegibilidade a Destaque.
- **A RFC descreve outro desenho.** Enquanto ela disser EC2 + SSH, dois critérios
  obrigatórios que exigem conformidade *"conforme o RFC"* ficam divergentes do código.
  Correção prevista na **RFC v1.1**, autorizada pelo professor, com changelog.
- **Duas decisões derivadas ficam para ADR próprio:** a task Fargate em sub-rede
  pública para evitar o NAT Gateway (~US$ 35/mês) e o detalhamento do RDS em sub-rede
  privada.
- **O KPI de 200 usuários simultâneos continua sem prova.** Uma task de 0.25 vCPU não
  sustenta isso por decreto — exige teste de carga.
