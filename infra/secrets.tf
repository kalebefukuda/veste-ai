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
