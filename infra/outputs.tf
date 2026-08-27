output "ecr_repository_url" {
  description = "Destino do push da imagem no pipeline."
  value       = aws_ecr_repository.api.repository_url
}

output "github_actions_role_arn" {
  description = "Role assumida pelo workflow por OIDC."
  value       = aws_iam_role.github_actions.arn
}

output "ecs_cluster_name" {
  description = "Cluster alvo do update-service."
  value       = aws_ecs_cluster.this.name
}

output "images_bucket" {
  description = "Bucket privado das imagens de look."
  value       = aws_s3_bucket.images.bucket
}

output "api_url" {
  description = "Endereço público da API. Vazio enquanto enable_runtime for falso."
  value       = var.enable_runtime ? "http${var.domain_name == "" ? "" : "s"}://${var.domain_name == "" ? aws_lb.this[0].dns_name : var.domain_name}" : ""
}
