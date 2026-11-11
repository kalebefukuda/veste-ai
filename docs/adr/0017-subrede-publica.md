# ADR-0017 — Task Fargate em sub-rede pública, sem NAT Gateway

Data: 26/08/2026 · Status: aceita

## Contexto

A task do Fargate precisa alcançar a internet para puxar a imagem do **ECR**, ler o
**Secrets Manager**, gravar no **S3** e chamar a **Gemini**. O desenho convencional
coloca a task numa sub-rede privada e dá saída a ela por um **NAT Gateway**.

O problema é o preço. Um NAT Gateway custa cerca de **US$ 35/mês** — mais que o ALB
(~US$ 22) e mais que o RDS `db.t4g.micro` (~US$ 22) isoladamente, e quase tanto quanto
os três serviços do desenho somados. Com **US$ 120** de crédito para durar até a
divulgação das notas em dezembro, ele sozinho comeria mais de um quarto do orçamento
para não entregar nenhuma função de produto.

## Alternativas consideradas

**A — Sub-rede privada com NAT Gateway.** O padrão de mercado e o que qualquer
referência de arquitetura recomenda. Custa ~US$ 35/mês, e derruba a viabilidade da
estratégia de três fases: seria a quarta peça cara a ligar e desligar.

**B — VPC endpoints para ECR, S3 e Secrets Manager.** Evita o NAT mantendo a task
privada. São quatro endpoints de interface, com custo por hora **e** por GB
processado, e é a opção que mais adiciona recursos para manter.

**C — Sub-rede pública com IP público e entrada travada.** A task recebe IP público e
sai pela rota do internet gateway, que não cobra. A entrada é controlada pelo security
group, que aceita a porta 8000 **somente** vinda do security group do ALB.

## Decisão

**C.** A task fica em sub-rede pública com `assign_public_ip = true`, e a única regra
de entrada do seu security group referencia o security group do ALB — não um bloco de
IPs.

O banco continua em **sub-rede privada**, sem IP público, aceitando conexão apenas do
security group da task. As sub-redes privadas não têm rota de saída, o que é
proposital: o RDS não precisa alcançar a internet, e dar essa rota a ele é exatamente o
que exigiria o NAT.

## Consequências

**O que fica mais fácil**

- Economiza ~US$ 35/mês, que é a diferença entre o crédito durar ~2 meses ou ~1,4.
- Uma peça a menos para ligar e desligar na estratégia de três fases.
- Sem endpoints de VPC para manter e pagar por GB.

**O que passa a custar caro**

- **O desenho parece errado numa leitura rápida.** "Container em sub-rede pública" é o
  tipo de frase que levanta a mão de um avaliador, e a defesa depende de explicar que a
  proteção real vem do security group, não da tabela de rotas. Este ADR existe para que
  a explicação esteja escrita antes da pergunta.
- **A superfície é um IP público sem porta alcançável.** O security group não abre
  nenhuma porta para a internet, então não há caminho de entrada — mas a proteção passa
  a depender de uma regra estar correta, em vez de depender da topologia. Uma regra de
  entrada mal escrita expõe a API direto; na sub-rede privada, o mesmo erro não teria
  efeito.
- **Não é o padrão que se leva para produção séria.** Num projeto com orçamento, a
  opção A é a certa. O que sustenta esta decisão é o contexto de crédito finito de um
  TCC, e ela deve ser revista se o contexto mudar.
