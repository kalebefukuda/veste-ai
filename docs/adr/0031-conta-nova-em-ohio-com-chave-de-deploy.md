# ADR-0031 — A AWS passa para uma conta nova em Ohio, e o pipeline entra por chave

Data: 07/11/2026 · Status: aceita

## Contexto

Em 06/11, ativar o IAM Identity Center criou uma AWS Organization na conta do projeto.
Entrar numa Organization faz upgrade automático do plano gratuito: os US$ 120 de crédito
expiraram no mesmo dia, com US$ 0,06 usados. O pedido de reintegração está no chamado
179408970200168 do AWS Support, sem resposta definitiva.

Uma conta nova, criada pelo cadastro atual da AWS, recebeu US$ 200 de crédito: US$ 100 de
abertura e US$ 100 das cinco atividades de onboarding. Ela tem duas travas, impostas por
SCPs de uma organização gerenciada pela própria AWS:

- **Só `us-east-2` (Ohio).** Liberar outras regiões exige ativar os "recursos avançados",
  que criam uma Organization com Identity Center e uma conta de gestão nova, abaixo da qual
  a conta com o crédito passaria a ficar. É o mesmo tipo de mudança que zerou a conta
  anterior, e não tem volta.
- **Sem provedor OIDC.** O simulador do IAM mostra negação explícita para
  `iam:CreateOpenIDConnectProvider`, para SAML e para Roles Anywhere. A autenticação do
  ADR-0030 não é possível nesta conta. Usuário IAM e chave de acesso são permitidos.

O resto do desenho (rede, ECS, RDS, ALB, ACM, ECR, S3, Secrets Manager e logs) aparece
como permitido em `us-east-2`.

## Decisão

**Toda a infraestrutura da AWS passa para a conta nova, em `us-east-2`**: na variável
`region`, no backend do estado e no bootstrap.

**O servidor do front na Vercel vai para Cleveland (`cle1`)**, a mesma região da API,
pelo `regions` do `frontend/vercel.json`. Toda ação do site passa por ele antes de chegar
à API.

**O pipeline entra por um usuário IAM só dele**, `vesteai-github-deploy`, com a mesma
política mínima que a role de OIDC tinha. A chave desse usuário:

- é criada no console, nunca pelo Terraform, porque ali ela ficaria no arquivo de estado;
- fica só nos segredos do ambiente `production` do GitHub, que exige aprovação e aceita
  só a `main`, a mesma condição que o OIDC impunha pelo `sub` do token;
- é trocada a cada 90 dias.

Os recursos avançados da conta ficam desativados.

## Consequências

**Latência.** Medido da máquina do autor: ~0,05 s até São Paulo e ~0,18 s até Ohio. Com a
Vercel em Cleveland, a API fica a milissegundos do servidor do front. Para quem acessa do
Brasil, cada clique fica cerca de 0,1 s mais lento do que com tudo em São Paulo. A geração
por IA leva de 5 a 30 s no Google, e essa diferença não aparece nela.

**Custo.** Ohio é mais barato que São Paulo, e o crédito cobre o runtime até as notas. A
conta tem limite de gasto de US$ 80 por mês, contado antes do crédito: um limite menor que
o custo do runtime pausaria o projeto. Os controles que pausam recursos antes do limite
ficaram desligados pelo mesmo motivo.

**Segurança.** Chave de longa duração é pior que credencial temporária. O ambiente com
aprovador, a restrição à `main`, a política mínima e a troca periódica reduzem o estrago
de um vazamento, sem eliminá-lo.

**LGPD.** Os dados pessoais passam a ficar nos Estados Unidos, o que é transferência
internacional (Lei 13.709/2018, art. 33). A política de privacidade declara isso. A
hipótese do art. 33 aplicável precisa ser validada antes da entrega.

**Documentos anteriores.** Este ADR substitui a região fechada no ADR-0002 (atualização de
27/10) e a autenticação do ADR-0030. A conta antiga mantém só a camada gratuita até ser
apagada.
