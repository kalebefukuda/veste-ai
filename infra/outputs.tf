output "ecr_repository_url" {
  description = "Destino do push da imagem no pipeline."
  value       = aws_ecr_repository.api.repository_url
}

output "github_deploy_user" {
  description = "Usuário do pipeline. A chave dele é criada no console, nunca pelo Terraform."
  value       = aws_iam_user.github_deploy.name
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

# Os registros que precisam ser criados no DNS para o certificado sair de pendente.
output "acm_validation_records" {
  description = "Registros DNS de validação do certificado."
  value = var.enable_runtime && var.domain_name != "" ? [
    for o in aws_acm_certificate.this[0].domain_validation_options : {
      name  = o.resource_record_name
      type  = o.resource_record_type
      value = o.resource_record_value
    }
  ] : []
}
