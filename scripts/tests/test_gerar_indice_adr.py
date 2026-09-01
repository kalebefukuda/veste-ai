from pathlib import Path

import pytest

from gerar_indice_adr import Adr, HeaderInvalido, montar_indice, ler_adr

BASE_URL = "https://github.com/kalebefukuda/veste-ai/blob/dev/docs/adr"

CABECALHO = """# ADR-0002 — Hospedagem: AWS gerenciada no lugar da Railway

Data: 26/08/2026 · Status: aceita

## Contexto

O professor recusou a Railway.
"""


def test_le_numero_titulo_data_e_status_do_cabecalho(tmp_path: Path) -> None:
    arquivo = tmp_path / "0002-hospedagem.md"
    arquivo.write_text(CABECALHO, encoding="utf-8")

    adr = ler_adr(arquivo)

    assert adr.numero == "0002"
    assert adr.titulo == "Hospedagem: AWS gerenciada no lugar da Railway"
    assert adr.data == "26/08/2026"
    assert adr.status == "aceita"
    assert adr.arquivo == "0002-hospedagem.md"


def test_aceita_sufixo_de_letra_no_numero(tmp_path: Path) -> None:
    arquivo = tmp_path / "0011b-transporte-do-jwt.md"
    arquivo.write_text(
        "# ADR-0011b — JWT em cookie `httpOnly`\n\nData: 27/08/2026 · Status: aceita\n",
        encoding="utf-8",
    )

    assert ler_adr(arquivo).numero == "0011b"


def test_titulo_com_travessao_no_meio_nao_e_cortado(tmp_path: Path) -> None:
    arquivo = tmp_path / "0009-cache.md"
    arquivo.write_text(
        "# ADR-0009 — Cache no feed — Redis e não Nginx\n\nData: 01/09/2026 · Status: aceita\n",
        encoding="utf-8",
    )

    assert ler_adr(arquivo).titulo == "Cache no feed — Redis e não Nginx"


def test_cabecalho_fora_do_padrao_falha_alto(tmp_path: Path) -> None:
    arquivo = tmp_path / "0003-sem-data.md"
    arquivo.write_text("# ADR-0003 — Decisão sem linha de data\n\n## Contexto\n", encoding="utf-8")

    with pytest.raises(HeaderInvalido, match="0003-sem-data.md"):
        ler_adr(arquivo)


def test_indice_ordena_por_numero_e_nao_pela_ordem_de_entrada() -> None:
    adrs = [
        Adr("0015", "Bibliotecas de auth", "27/08/2026", "aceita", "0015-auth.md"),
        Adr("0002", "Hospedagem", "26/08/2026", "aceita", "0002-hospedagem.md"),
        Adr("0011b", "Transporte do JWT", "27/08/2026", "aceita", "0011b-jwt.md"),
    ]

    linhas = [linha for linha in montar_indice(adrs, BASE_URL).splitlines() if linha.startswith("| [")]

    assert [linha.split("]")[0].removeprefix("| [") for linha in linhas] == [
        "ADR-0002",
        "ADR-0011b",
        "ADR-0015",
    ]


def test_cada_linha_do_indice_aponta_para_o_arquivo_de_origem() -> None:
    adrs = [Adr("0002", "Hospedagem", "26/08/2026", "aceita", "0002-hospedagem.md")]

    indice = montar_indice(adrs, BASE_URL)

    assert f"[ADR-0002]({BASE_URL}/0002-hospedagem.md)" in indice
    assert "| Hospedagem | 26/08/2026 | aceita |" in indice


def test_indice_avisa_que_e_gerado() -> None:
    indice = montar_indice([], BASE_URL)

    assert "docs/adr/" in indice
    assert "não editar" in indice.lower()
