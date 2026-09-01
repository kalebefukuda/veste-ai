"""Gera o índice de ADRs a partir dos cabeçalhos dos arquivos de `docs/adr/`."""

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path

CABECALHO = re.compile(r"^# ADR-(?P<numero>\d+[a-z]?) — (?P<titulo>.+)$", re.MULTILINE)
METADADO = re.compile(r"^Data: (?P<data>.+?) · Status: (?P<status>.+)$", re.MULTILINE)


class HeaderInvalido(Exception):
    pass


@dataclass(frozen=True)
class Adr:
    numero: str
    titulo: str
    data: str
    status: str
    arquivo: str


def ler_adr(caminho: Path) -> Adr:
    texto = caminho.read_text(encoding="utf-8")
    cabecalho = CABECALHO.search(texto)
    metadado = METADADO.search(texto)
    if not cabecalho or not metadado:
        raise HeaderInvalido(
            f"{caminho.name}: esperava '# ADR-NNNN — Título' e 'Data: … · Status: …'"
        )
    return Adr(
        numero=cabecalho["numero"],
        titulo=cabecalho["titulo"].strip(),
        data=metadado["data"].strip(),
        status=metadado["status"].strip(),
        arquivo=caminho.name,
    )


def montar_indice(adrs: list[Adr], base_url: str) -> str:
    linhas = [
        "# ADRs",
        "",
        "Índice gerado pelo pipeline a partir de `docs/adr/`. Não editar à mão —"
        " a decisão é escrita no arquivo de origem e esta página é refeita a cada sync.",
        "",
        "| ADR | Decisão | Data | Status |",
        "|---|---|---|---|",
    ]
    for adr in sorted(adrs, key=lambda a: a.numero):
        linhas.append(
            f"| [ADR-{adr.numero}]({base_url}/{adr.arquivo})"
            f" | {adr.titulo} | {adr.data} | {adr.status} |"
        )
    return "\n".join(linhas) + "\n"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--adr-dir", type=Path, default=Path("docs/adr"))
    parser.add_argument("--out", type=Path, default=Path("docs/generated/ADRs.md"))
    parser.add_argument(
        "--base-url",
        default="https://github.com/kalebefukuda/veste-ai/blob/dev/docs/adr",
        help="prefixo do link — a wiki é outro repositório, então precisa ser absoluto",
    )
    args = parser.parse_args(argv)

    arquivos = sorted(args.adr_dir.glob("*.md"))
    if not arquivos:
        print(f"nenhum ADR em {args.adr_dir}", file=sys.stderr)
        return 1

    adrs = [ler_adr(arquivo) for arquivo in arquivos]
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(montar_indice(adrs, args.base_url), encoding="utf-8")
    print(f"{args.out}: {len(adrs)} ADRs")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
