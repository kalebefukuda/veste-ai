# Prometheus em modo agente ao lado da API: coleta pela rede da task e envia ao Grafana Cloud.
locals {
  prometheus = [for url in compact([var.grafana_cloud_remote_write_url]) : {
    name       = "prometheus"
    image      = "prom/prometheus:v3.5.0"
    essential  = false
    entryPoint = ["/bin/sh", "-c"]
    command = [<<-EOT
      printf '%s' "$REMOTE_WRITE_TOKEN" > /prometheus/token
      cat > /prometheus/prometheus.yml <<CONFIG
      global:
        scrape_interval: 30s
      scrape_configs:
        - job_name: vesteai-api
          static_configs:
            - targets: ["localhost:9100"]
      remote_write:
        - url: $REMOTE_WRITE_URL
          basic_auth:
            username: "$REMOTE_WRITE_USER"
            password_file: /prometheus/token
      CONFIG
      exec /bin/prometheus --agent --config.file=/prometheus/prometheus.yml --storage.agent.path=/prometheus/agent
    EOT
    ]

    environment = [
      { name = "REMOTE_WRITE_URL", value = url },
      { name = "REMOTE_WRITE_USER", value = var.grafana_cloud_user },
    ]

    secrets = [
      { name = "REMOTE_WRITE_TOKEN", valueFrom = aws_secretsmanager_secret.grafana_cloud_token.arn },
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.api.name
        "awslogs-region"        = var.region
        "awslogs-stream-prefix" = "prometheus"
      }
    }
  }]
}
