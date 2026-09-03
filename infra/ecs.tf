resource "aws_ecs_cluster" "this" {
  name = var.project
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/${var.project}-api"
  retention_in_days = 14
}

resource "aws_ecs_task_definition" "api" {
  count = var.enable_runtime ? 1 : 0

  family                   = "${var.project}-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task.arn

  # Padrão de localhost em produção falha calado: o e-mail sai, entrega, e o link
  # não vai a lugar nenhum. Melhor o apply recusar.
  lifecycle {
    precondition {
      condition     = !var.enable_runtime || !can(regex("localhost", var.frontend_origin))
      error_message = "frontend_origin ainda aponta para localhost — o CORS recusaria o frontend real."
    }

    precondition {
      condition     = !var.enable_runtime || !can(regex("^$|localhost", var.frontend_reset_url))
      error_message = "frontend_reset_url está vazio ou em localhost — o e-mail de reset não levaria a lugar nenhum."
    }
  }

  container_definitions = jsonencode([{
    name      = "api"
    image     = "${aws_ecr_repository.api.repository_url}:${var.api_image_tag}"
    essential = true

    portMappings = [{
      containerPort = 8000
      protocol      = "tcp"
    }]

    # Credencial vai em `secrets`; `environment` é texto plano visível no console.
    environment = concat([
      { name = "FRONTEND_ORIGIN", value = var.frontend_origin },
      { name = "AWS_S3_BUCKET", value = aws_s3_bucket.images.bucket },
      ], var.frontend_reset_url == "" ? [] : [
      { name = "FRONTEND_RESET_URL", value = var.frontend_reset_url },
    ])

    secrets = [
      { name = "DATABASE_URL", valueFrom = aws_secretsmanager_secret.db_url.arn },
      { name = "JWT_SECRET", valueFrom = aws_secretsmanager_secret.jwt.arn },
      { name = "BREVO_API_KEY", valueFrom = aws_secretsmanager_secret.brevo_api_key.arn },
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.api.name
        "awslogs-region"        = var.region
        "awslogs-stream-prefix" = "api"
      }
    }
  }])
}

resource "aws_ecs_service" "api" {
  count = var.enable_runtime ? 1 : 0

  name            = "${var.project}-api"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.api[0].arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.api.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api[0].arn
    container_name   = "api"
    container_port   = 8000
  }

  # O pipeline registra revisões novas da task definition a cada deploy.
  lifecycle {
    ignore_changes = [task_definition]
  }

  depends_on = [aws_lb_listener.http]
}
