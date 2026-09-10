resource "random_password" "db" {
  length  = 32
  special = false
}

resource "aws_secretsmanager_secret" "db_url" {
  name_prefix = "${var.project}/database-url-"
}

resource "aws_secretsmanager_secret_version" "db_url" {
  count = var.enable_runtime ? 1 : 0

  secret_id     = aws_secretsmanager_secret.db_url.id
  secret_string = "postgresql+psycopg://${var.db_username}:${random_password.db.result}@${aws_db_instance.this[0].endpoint}/${var.db_name}"
}

resource "aws_secretsmanager_secret" "jwt" {
  name_prefix = "${var.project}/jwt-secret-"
}

resource "random_password" "jwt" {
  length  = 64
  special = false
}

resource "aws_secretsmanager_secret_version" "jwt" {
  secret_id     = aws_secretsmanager_secret.jwt.id
  secret_string = random_password.jwt.result
}

resource "aws_secretsmanager_secret" "brevo_api_key" {
  name_prefix = "${var.project}/brevo-api-key-"
}

# O valor real é colado no console: chave em .tf ou .tfvars acaba no arquivo de estado.
resource "aws_secretsmanager_secret_version" "brevo_api_key" {
  secret_id     = aws_secretsmanager_secret.brevo_api_key.id
  secret_string = "definir-no-console"

  lifecycle {
    ignore_changes = [secret_string]
  }
}

# Endereço pessoal de quem responde pelos dados. Vai em Secrets Manager e não em
# `environment` porque este arquivo é versionado num repositório público: o endereço
# ficaria no histórico do git para sempre.
resource "aws_secretsmanager_secret" "contact_destination" {
  name_prefix = "${var.project}/contact-destination-"
}

# O valor real é colado no console, pelo mesmo motivo da chave do Brevo.
resource "aws_secretsmanager_secret_version" "contact_destination" {
  secret_id     = aws_secretsmanager_secret.contact_destination.id
  secret_string = "definir-no-console"

  lifecycle {
    ignore_changes = [secret_string]
  }
}
