import json
from pathlib import Path

import yaml

RAIZ = Path(__file__).resolve().parents[2]
TEXTO_DO_CI = (RAIZ / ".github" / "workflows" / "ci.yml").read_text()
JOBS = yaml.safe_load(TEXTO_DO_CI)["jobs"]
VERCEL = json.loads((RAIZ / "frontend" / "vercel.json").read_text())

CHECAGENS = {"backend", "frontend", "infra", "scripts"}
DOMINIO_DE_HOMOLOGACAO = "staging.vesteai.site"
PRODUCAO = ("deploy-api-production", "deploy-web-production")
HOMOLOGACAO = ("deploy-web-staging",)


def _lista(valor: str | list[str] | None) -> list[str]:
    if valor is None:
        return []
    return [valor] if isinstance(valor, str) else valor


def _espera(nome: str) -> set[str]:
    diretos = set(_lista(JOBS[nome].get("needs")))
    return diretos.union(*(_espera(job) for job in diretos))


def _comandos(nome: str) -> list[str]:
    return [passo.get("run", "") for passo in JOBS[nome]["steps"]]


def _ambiente(nome: str) -> str:
    ambiente = JOBS[nome]["environment"]
    return ambiente if isinstance(ambiente, str) else ambiente["name"]


def test_o_pipeline_tem_homologacao_e_producao() -> None:
    assert set(PRODUCAO + HOMOLOGACAO) <= set(JOBS)


# Nada é publicado com teste vermelho.
def test_todo_deploy_espera_o_ci_verde() -> None:
    for nome in PRODUCAO + HOMOLOGACAO:
        assert CHECAGENS <= _espera(nome), f"{nome} não espera {CHECAGENS - _espera(nome)}"


def test_pull_request_nunca_publica() -> None:
    for nome in PRODUCAO + HOMOLOGACAO:
        assert "github.event_name == 'push'" in JOBS[nome]["if"]


def test_producao_so_sai_da_main_e_homologacao_so_da_dev() -> None:
    for nome in PRODUCAO:
        assert "github.ref == 'refs/heads/main'" in JOBS[nome]["if"]
    for nome in HOMOLOGACAO:
        assert "github.ref == 'refs/heads/dev'" in JOBS[nome]["if"]


# O ambiente production é o que pede aprovação de uma pessoa antes de seguir.
def test_producao_passa_pelo_ambiente_que_pede_aprovacao() -> None:
    assert {_ambiente(nome) for nome in PRODUCAO} == {"production"}
    assert {_ambiente(nome) for nome in HOMOLOGACAO} == {"staging"}


def test_a_homologacao_fica_sempre_no_mesmo_endereco() -> None:
    publica = [c for c in _comandos("deploy-web-staging") if "vercel deploy" in c]

    assert JOBS["deploy-web-staging"]["environment"]["url"] == f"https://{DOMINIO_DE_HOMOLOGACAO}"
    assert len(publica) == 1
    assert f"vercel alias set \"$url\" {DOMINIO_DE_HOMOLOGACAO}" in publica[0]


def test_deploys_de_producao_nao_correm_juntos() -> None:
    for nome in PRODUCAO:
        assert JOBS[nome]["concurrency"]["cancel-in-progress"] is False


# A conta da AWS proíbe provedor OIDC; a chave só sai do ambiente que pede aprovação — ADR-0031.
def test_a_chave_da_aws_so_e_usada_no_deploy_de_producao() -> None:
    job = JOBS["deploy-api-production"]
    credenciais = next(p for p in job["steps"] if "configure-aws-credentials" in p.get("uses", ""))

    segredo = "${{ secrets."

    assert credenciais["with"]["aws-access-key-id"] == segredo + "AWS_ACCESS_KEY_ID }}"
    assert credenciais["with"]["aws-secret-access-key"] == segredo + "AWS_SECRET_ACCESS_KEY }}"
    assert TEXTO_DO_CI.count("secrets.AWS_") == 2
    assert "id-token" not in job["permissions"]


def test_a_api_e_publicada_em_ohio() -> None:
    assert JOBS["deploy-api-production"]["env"]["AWS_REGION"] == "us-east-2"


def test_as_migrations_rodam_antes_de_trocar_o_servico() -> None:
    comandos = _comandos("deploy-api-production")
    migracao = next(i for i, c in enumerate(comandos) if "alembic" in c and "upgrade" in c)
    troca = next(i for i, c in enumerate(comandos) if "update-service" in c)

    assert migracao < troca


def test_a_api_confere_a_saude_depois_de_trocar() -> None:
    comandos = _comandos("deploy-api-production")
    troca = next(i for i, c in enumerate(comandos) if "update-service" in c)

    assert any("/health" in c for c in comandos[troca + 1 :])


# O front só vai para produção depois da API, para a tela nunca chamar rota que não existe.
def test_o_front_de_producao_espera_a_api() -> None:
    assert "deploy-api-production" in _espera("deploy-web-production")


def test_o_token_da_vercel_vem_dos_segredos() -> None:
    referencia_ao_segredo = "${{ secrets." + "VERCEL_TOKEN }}"

    for nome in ("deploy-web-production", "deploy-web-staging"):
        assert JOBS[nome]["env"]["VERCEL_TOKEN"] == referencia_ao_segredo


# Quem publica é o pipeline: a integração da Vercel com o GitHub não dispara nada.
def test_a_vercel_nao_publica_sozinha() -> None:
    assert VERCEL["git"]["deploymentEnabled"] is False


# O servidor do front chama a API a cada ação: os dois ficam na mesma região.
def test_o_servidor_do_front_roda_ao_lado_da_api() -> None:
    assert VERCEL["regions"] == ["cle1"]
