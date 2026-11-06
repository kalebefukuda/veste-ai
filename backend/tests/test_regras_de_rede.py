import re
from pathlib import Path

REDE = Path(__file__).resolve().parents[2] / "infra" / "network.tf"

# O que a EC2 aceita em descrição de security group e de regra; acento só falha no apply.
ACEITO = re.compile(r"^[a-zA-Z0-9. _\-:/()#,@\[\]+=&;{}!$*]*$")
BLOCO = re.compile(
    r'resource "aws_(?:security_group|vpc_security_group_(?:ingress|egress)_rule)"[^{]*\{(.*?)\n\}',
    re.S,
)
DESCRICAO = re.compile(r'description\s*=\s*"([^"]*)"')


def test_descricao_de_rede_so_usa_o_que_a_aws_aceita() -> None:
    descricoes = [d for bloco in BLOCO.findall(REDE.read_text()) for d in DESCRICAO.findall(bloco)]

    recusadas = [d for d in descricoes if not ACEITO.match(d)]

    assert descricoes
    assert not recusadas, f"a AWS recusa: {recusadas}"
