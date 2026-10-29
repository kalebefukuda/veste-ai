# Cria o bucket onde mora o estado do Terraform de infra/ — ADR-0026.
terraform {
  required_version = "~> 1.15"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "sa-east-1"

  default_tags {
    tags = {
      Project   = "vesteai"
      ManagedBy = "terraform"
    }
  }
}

resource "aws_s3_bucket" "state" {
  bucket_prefix = "vesteai-tfstate-"

  # Sem o estado, o Terraform perde de vista tudo o que criou.
  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket = aws_s3_bucket.state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Cada `apply` vira uma versão: um estado corrompido volta para o anterior.
resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id

  versioning_configuration {
    status = "Enabled"
  }
}

output "bucket" {
  description = "Nome do bucket, passado no `terraform init` de infra/."
  value       = aws_s3_bucket.state.bucket
}
