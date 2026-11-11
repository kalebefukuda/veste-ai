# ADR-0029 — Monitoramento: Prometheus ao lado da API, Grafana no Grafana Cloud

Data: 06/11/2026 · Status: aceita

## Contexto

A RFC (§5.4) promete Prometheus e Grafana "executados como serviços auxiliares ao lado
da API no ECS". Eles devem acompanhar a latência das rotas, a taxa de erros HTTP, a CPU, a
memória e a disponibilidade. Os alertas cobrem disponibilidade abaixo de 99% (RNF08) e
latência acima das RNF01 a RNF03. A linha Web Apps exige monitoramento ou
observabilidade. Até aqui, nada disso existia: a API só tinha log estruturado no
CloudWatch.

Rodar o Grafana no ECS pediria um endereço público com login (`grafana.vesteai.site`),
uma regra no ALB, um certificado, e disco para o histórico não zerar a cada deploy. É
mais superfície exposta e mais custo enquanto o runtime estiver ligado.

## Decisão

**A API expõe as métricas numa porta própria, a 9100**, que nenhuma regra de rede abre:
nem o security group nem o ALB conhecem essa porta. Ela escuta só no `127.0.0.1` por
padrão (`METRICS_ADDR`); o compose abre para a rede dele, onde o Prometheus é outro
container. Pela API pública, `/metrics` responde 404. As métricas cobrem:

- requisições, por método, rota e status;
- tempo de resposta, por rota;
- gerações, por resultado, e o tempo de cada geração;
- cliques que levaram à loja (RN08);
- CPU e memória do processo, que a biblioteca já entrega.

**A rota entra no rótulo pelo molde** (`/clicks/{piece_id}`), nunca pelo caminho.
Com o id no rótulo, cada look viraria uma série nova e as métricas passariam a carregar
identificador. Caminho que não casa com nenhuma rota vira `unmatched`. Nenhuma métrica
leva id, e-mail ou IP.

**Na AWS, o Prometheus roda em modo agente como segundo container da task da API**,
que é o serviço auxiliar ao lado da API de que a RFC fala. Ele lê `localhost:9100` pela
rede da própria task e envia as amostras ao Grafana Cloud por remote write.

- Não é essencial: se ele cair, a API continua.
- Só entra na task quando `grafana_cloud_remote_write_url` está preenchida.
- O token vai pelo Secrets Manager, com o mesmo placeholder das outras chaves.

**O Grafana é o do Grafana Cloud**, no plano gratuito, e é lá que ficam o painel e os
alertas. O painel é um arquivo do repositório
(`infra/monitoring/grafana/dashboards/vesteai.json`): no Cloud ele é importado, e no
Grafana local ele carrega sozinho.

**No ambiente local**, o Docker Compose sobe o Prometheus e o Grafana com o mesmo
painel, nas portas 9090 e 3030, presas ao `127.0.0.1`.

Os alertas, configurados no Grafana Cloud:

| Alerta | Condição | Origem |
|---|---|---|
| Disponibilidade | abaixo de 99% em 24 h | RNF08 |
| Leitura lenta | p95 dos `GET` acima de 300 ms por 10 min | RNF03 |
| Redirecionamento lento | p95 de `/clicks/{piece_id}` acima de 500 ms por 10 min | RNF02 |
| Erros | 5xx acima de 5% das requisições por 5 min | — |
| Geração lenta | p95 acima de 30 s em 1 h | critério de aceite da RFC |

A RNF01, o feed em 2 s, se mede no navegador. Do lado da API, o painel mostra o tempo
da rota do feed.

## Consequências

A decisão diverge da RFC num ponto: o Grafana não roda no ECS. O Prometheus fica ao lado
da API, como a RFC descreve; o que muda é quem hospeda o Grafana.

O agente cabe na task atual, de 0,25 vCPU e 512 MB. Se a memória apertar, o quadro
"Memória da API" mostra, e `task_memory` sobe para 1024. O custo novo é um segredo a
mais no Secrets Manager.

O histórico mora no Grafana Cloud e sobrevive aos deploys. O plano gratuito tem limite
de retenção e de séries; conferir antes de ligar.

O que sai da AWS para o Grafana Cloud são números técnicos e agregados, sem dado
pessoal.

Os contadores zeram quando a API reinicia, e `rate` e `increase` já tratam isso. O
health check do ALB bate em `/health` o tempo todo, por isso os quadros de tráfego
deixam essa rota de fora.
