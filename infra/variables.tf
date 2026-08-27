variable "project" {
  description = "Prefixo aplicado ao nome de todo recurso."
  type        = string
  default     = "vesteai"
}

# Decisão reaberta: us-east-1 custa ~35% menos e rende ~1 mês a mais de crédito.
# Pendente da modelagem no AWS Pricing Calculator — ver ADR-0002.
variable "region" {
  description = "Região da AWS."
  type        = string
  default     = "sa-east-1"
}

# Falso derruba ALB, RDS e as tasks do Fargate, que somam quase todo o custo,
# preservando VPC, ECR e S3 — a estratégia de três fases do ADR-0002.
variable "enable_runtime" {
  description = "Cria a infraestrutura que cobra por hora."
  type        = bool
  default     = false
}

variable "domain_name" {
  description = "Domínio do backend. Vazio mantém o ALB em HTTP, sem certificado."
  type        = string
  default     = ""
}

variable "github_repository" {
  description = "Repositório autorizado a assumir a role por OIDC, no formato dono/nome."
  type        = string
  default     = "kalebefukuda/veste-ai"
}

variable "db_name" {
  description = "Nome do banco criado na instância."
  type        = string
  default     = "vesteai"
}

variable "db_username" {
  description = "Usuário administrador do banco."
  type        = string
  default     = "vesteai"
}

variable "db_instance_class" {
  description = "Classe da instância do RDS."
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "Armazenamento do RDS, em GB."
  type        = number
  default     = 20
}

variable "task_cpu" {
  description = "CPU da task Fargate, em unidades."
  type        = number
  default     = 256
}

variable "task_memory" {
  description = "Memória da task Fargate, em MiB."
  type        = number
  default     = 512
}

variable "frontend_origin" {
  description = "Origem liberada no CORS do backend."
  type        = string
  default     = "http://localhost:3000"
}

variable "deploy_branch" {
  description = "Única branch autorizada a assumir a role de deploy por OIDC."
  type        = string
  default     = "main"
}

variable "api_image_tag" {
  description = "Tag da imagem inicial. O pipeline passa a gerenciar isso depois do primeiro deploy."
  type        = string
  default     = "bootstrap"
}

variable "final_snapshot_identifier" {
  description = "Snapshot tirado antes de destruir o banco. Vazio destrói sem snapshot e perde os dados."
  type        = string
  default     = "vesteai-final"
}
