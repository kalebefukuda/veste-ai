import re
from pathlib import Path

from app.config import Settings

TASK = Path(__file__).resolve().parents[2] / "infra" / "ecs.tf"

# `value` é texto plano no console da AWS; `valueFrom` aponta para o Secrets Manager.
VARIAVEL = re.compile(r'name\s*=\s*"([A-Z0-9_]+)",?\s*(value|valueFrom)\s*=')
SEGREDO = re.compile(r"aws_secretsmanager_secret\.(\w+)\.arn")
ESPERA = re.compile(r"depends_on\s*=\s*\[([^\]]*)\]")

CREDENCIAIS = (
    "DATABASE_URL",
    "JWT_SECRET",
    "BREVO_API_KEY",
    "CONTACT_DESTINATION",
    "GEMINI_API_KEY",
    "SAFE_BROWSING_API_KEY",
)


def _variaveis_da_task() -> dict[str, str]:
    return dict(VARIAVEL.findall(TASK.read_text()))


def test_toda_variavel_da_task_e_lida_pela_api() -> None:
    lidas = {campo.upper() for campo in Settings.model_fields}

    ignoradas = set(_variaveis_da_task()) - lidas

    assert not ignoradas, f"a API não lê {sorted(ignoradas)}"


def test_a_task_aponta_o_bucket_de_imagens() -> None:
    assert _variaveis_da_task().get("S3_BUCKET") == "value"


def test_toda_credencial_vai_pelo_secrets_manager() -> None:
    variaveis = _variaveis_da_task()

    fora = [nome for nome in CREDENCIAIS if variaveis.get(nome) != "valueFrom"]

    assert not fora, f"fora do Secrets Manager: {fora}"


# O service sobe a task na hora, e segredo ainda sem valor a derruba antes do primeiro request.
def test_o_servico_so_sobe_com_valor_em_todo_segredo() -> None:
    texto = TASK.read_text()
    esperados = {f"aws_secretsmanager_secret_version.{nome}" for nome in SEGREDO.findall(texto)}
    espera = set(re.findall(r"[\w.]+", " ".join(ESPERA.findall(texto))))

    faltando = sorted(esperados - espera)

    assert not faltando, f"o service não espera {faltando}"
