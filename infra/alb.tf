resource "aws_lb" "this" {
  count = var.enable_runtime ? 1 : 0

  name               = "${var.project}-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
}

resource "aws_lb_target_group" "api" {
  count = var.enable_runtime ? 1 : 0

  name        = "${var.project}-api"
  port        = 8000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.this.id

  health_check {
    path                = "/health"
    matcher             = "200"
    interval            = 30
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

resource "aws_acm_certificate" "this" {
  count = var.enable_runtime && var.domain_name != "" ? 1 : 0

  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# O ALB recusa certificado que não esteja ISSUED, então o apply espera aqui até o
# registro DNS de validação existir — ver o passo de bootstrap em infra/README.md.
resource "aws_acm_certificate_validation" "this" {
  count = var.enable_runtime && var.domain_name != "" ? 1 : 0

  certificate_arn = aws_acm_certificate.this[0].arn

  timeouts {
    create = "30m"
  }
}

# Sem domínio o ALB serve HTTP direto; com domínio, a 80 só redireciona.
resource "aws_lb_listener" "http" {
  count = var.enable_runtime ? 1 : 0

  load_balancer_arn = aws_lb.this[0].arn
  port              = 80
  protocol          = "HTTP"

  dynamic "default_action" {
    for_each = var.domain_name == "" ? [1] : []

    content {
      type             = "forward"
      target_group_arn = aws_lb_target_group.api[0].arn
    }
  }

  dynamic "default_action" {
    for_each = var.domain_name == "" ? [] : [1]

    content {
      type = "redirect"

      redirect {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
  }
}

resource "aws_lb_listener" "https" {
  count = var.enable_runtime && var.domain_name != "" ? 1 : 0

  load_balancer_arn = aws_lb.this[0].arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate_validation.this[0].certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api[0].arn
  }
}
