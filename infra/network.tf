data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  azs             = slice(data.aws_availability_zones.available.names, 0, 2)
  public_subnets  = ["10.0.0.0/24", "10.0.1.0/24"]
  private_subnets = ["10.0.10.0/24", "10.0.11.0/24"]
}

resource "aws_vpc" "this" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = { Name = var.project }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = { Name = var.project }
}

resource "aws_subnet" "public" {
  count = length(local.public_subnets)

  vpc_id                  = aws_vpc.this.id
  cidr_block              = local.public_subnets[count.index]
  availability_zone       = local.azs[count.index]
  map_public_ip_on_launch = true

  tags = { Name = "${var.project}-public-${count.index}" }
}

# Privadas não têm rota de saída: o RDS não precisa alcançar a internet, e
# criar essa rota exigiria NAT Gateway, que custa mais que o resto somado.
resource "aws_subnet" "private" {
  count = length(local.private_subnets)

  vpc_id            = aws_vpc.this.id
  cidr_block        = local.private_subnets[count.index]
  availability_zone = local.azs[count.index]

  tags = { Name = "${var.project}-private-${count.index}" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = { Name = "${var.project}-public" }
}

resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "alb" {
  name        = "${var.project}-alb"
  description = "Entrada HTTP e HTTPS da internet no load balancer."
  vpc_id      = aws_vpc.this.id

  tags = { Name = "${var.project}-alb" }
}

resource "aws_vpc_security_group_ingress_rule" "alb_http" {
  security_group_id = aws_security_group.alb.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 80
  to_port           = 80
  ip_protocol       = "tcp"
  description       = "HTTP, redirecionado para HTTPS quando há certificado"
}

resource "aws_vpc_security_group_ingress_rule" "alb_https" {
  count = var.domain_name == "" ? 0 : 1

  security_group_id = aws_security_group.alb.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  description       = "HTTPS"
}

resource "aws_vpc_security_group_egress_rule" "alb_all" {
  security_group_id = aws_security_group.alb.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
  description       = "Saída livre para alcançar as tasks"
}

# A task fica em sub-rede pública com IP público para alcançar ECR e Secrets
# Manager sem NAT; a entrada é travada no security group do ALB — ver ADR-0017.
resource "aws_security_group" "api" {
  name        = "${var.project}-api"
  description = "Entrada da API vinda somente do load balancer."
  vpc_id      = aws_vpc.this.id

  tags = { Name = "${var.project}-api" }
}

resource "aws_vpc_security_group_ingress_rule" "api_from_alb" {
  security_group_id            = aws_security_group.api.id
  referenced_security_group_id = aws_security_group.alb.id
  from_port                    = 8000
  to_port                      = 8000
  ip_protocol                  = "tcp"
  description                  = "Somente o ALB alcança a API"
}

resource "aws_vpc_security_group_egress_rule" "api_all" {
  security_group_id = aws_security_group.api.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
  description       = "Saída para ECR, Secrets Manager, S3 e Gemini"
}

resource "aws_security_group" "db" {
  name        = "${var.project}-db"
  description = "Entrada do banco vinda somente da API."
  vpc_id      = aws_vpc.this.id

  tags = { Name = "${var.project}-db" }
}

resource "aws_vpc_security_group_ingress_rule" "db_from_api" {
  security_group_id            = aws_security_group.db.id
  referenced_security_group_id = aws_security_group.api.id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  description                  = "Somente a API alcança o banco"
}
