data "aws_caller_identity" "current" {}

# A conta proíbe provedor OIDC; a chave é criada no console e vai direto ao GitHub — ADR-0031.
resource "aws_iam_user" "github_deploy" {
  name = "${var.project}-github-deploy"
}

data "aws_iam_policy_document" "deploy" {
  statement {
    effect    = "Allow"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:CompleteLayerUpload",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:UploadLayerPart",
    ]
    resources = [aws_ecr_repository.api.arn]
  }

  # As duas não aceitam ARN de recurso.
  statement {
    effect    = "Allow"
    actions   = ["ecs:RegisterTaskDefinition", "ecs:DescribeTaskDefinition"]
    resources = ["*"]
  }

  # Migrations numa task avulsa da família da API, e só neste cluster.
  statement {
    effect  = "Allow"
    actions = ["ecs:RunTask"]
    resources = [
      "arn:aws:ecs:${var.region}:${data.aws_caller_identity.current.account_id}:task-definition/${var.project}-api:*",
    ]

    condition {
      test     = "ArnEquals"
      variable = "ecs:cluster"
      values   = [aws_ecs_cluster.this.arn]
    }
  }

  statement {
    effect  = "Allow"
    actions = ["ecs:DescribeTasks"]
    resources = [
      "arn:aws:ecs:${var.region}:${data.aws_caller_identity.current.account_id}:task/${aws_ecs_cluster.this.name}/*",
    ]
  }

  statement {
    effect  = "Allow"
    actions = ["ecs:DescribeServices", "ecs:UpdateService"]
    resources = [
      "arn:aws:ecs:${var.region}:${data.aws_caller_identity.current.account_id}:service/${aws_ecs_cluster.this.name}/${var.project}-api",
    ]
  }

  statement {
    effect    = "Allow"
    actions   = ["iam:PassRole"]
    resources = [aws_iam_role.task_execution.arn, aws_iam_role.task.arn]
  }
}

resource "aws_iam_user_policy" "deploy" {
  name   = "deploy"
  user   = aws_iam_user.github_deploy.name
  policy = data.aws_iam_policy_document.deploy.json
}

data "aws_iam_policy_document" "ecs_assume" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "task_execution" {
  name               = "${var.project}-task-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

resource "aws_iam_role_policy_attachment" "task_execution" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "aws_iam_policy_document" "task_execution_secrets" {
  statement {
    effect  = "Allow"
    actions = ["secretsmanager:GetSecretValue"]
    resources = [
      aws_secretsmanager_secret.db_url.arn,
      aws_secretsmanager_secret.jwt.arn,
      aws_secretsmanager_secret.brevo_api_key.arn,
      aws_secretsmanager_secret.contact_destination.arn,
      aws_secretsmanager_secret.gemini_api_key.arn,
      aws_secretsmanager_secret.safe_browsing_api_key.arn,
      aws_secretsmanager_secret.grafana_cloud_token.arn,
    ]
  }
}

resource "aws_iam_role_policy" "task_execution_secrets" {
  name   = "read-secrets"
  role   = aws_iam_role.task_execution.id
  policy = data.aws_iam_policy_document.task_execution_secrets.json
}

# A role da task dá acesso ao S3 por credencial temporária, sem usuário IAM com chave.
resource "aws_iam_role" "task" {
  name               = "${var.project}-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

data "aws_iam_policy_document" "task_s3" {
  statement {
    effect    = "Allow"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.images.arn}/*"]
  }
}

resource "aws_iam_role_policy" "task_s3" {
  name   = "images-bucket"
  role   = aws_iam_role.task.id
  policy = data.aws_iam_policy_document.task_s3.json
}
