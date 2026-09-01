"""Verifica os links das páginas de `docs/wiki/` antes de publicá-las na wiki.

A wiki do GitHub é outro repositório: link relativo não resolve lá. Então o único
link válido entre páginas é `[[Wikilink]]`, e imagem precisa de URL absoluta.
"""

import argparse
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

LINK = re.compile(r"!?\[[^\]]*\]\(([^)\s]+)")
WIKILINK = re.compile(r"\[\[([^\]|]+)")
PREFIXO_ASSETS = "/docs/assets/"


def _assets_apontado(url: str) -> str | None:
    partes = urlparse(url)
    if partes.netloc != "raw.githubusercontent.com" or PREFIXO_ASSETS not in partes.path:
        return None
    return partes.path.split(PREFIXO_ASSETS, 1)[1]


def _problemas_da_pagina(
    pagina: Path, assets_dir: Path, paginas: frozenset[str]
) -> list[str]:
    texto = pagina.read_text(encoding="utf-8")
    problemas = []

    for url in LINK.findall(texto):
        if url.startswith("#"):
            continue
        if urlparse(url).scheme in ("http", "https"):
            asset = _assets_apontado(url)
            if asset is not None and not (assets_dir / asset).exists():
                problemas.append(
                    f"{pagina.name}: {url} aponta para asset que não existe no repositório"
                )
            continue
        problemas.append(
            f"{pagina.name}: {url} é link relativo e a wiki é outro repositório —"
            " use [[Wikilink]] entre páginas ou URL absoluta"
        )

    for alvo in WIKILINK.findall(texto):
        if alvo not in paginas:
            problemas.append(f"{pagina.name}: [[{alvo}]] não corresponde a nenhuma página da wiki")

    return problemas


def verificar(
    wiki_dir: Path, assets_dir: Path, paginas_extra: tuple[str, ...] = ()
) -> list[str]:
    arquivos = sorted(wiki_dir.glob("*.md"))
    paginas = frozenset([arquivo.stem for arquivo in arquivos] + list(paginas_extra))
    return [
        problema
        for arquivo in arquivos
        for problema in _problemas_da_pagina(arquivo, assets_dir, paginas)
    ]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--wiki-dir", type=Path, default=Path("docs/wiki"))
    parser.add_argument("--assets-dir", type=Path, default=Path("docs/assets"))
    parser.add_argument(
        "--pagina-extra",
        action="append",
        default=[],
        help="página gerada pelo pipeline, que não existe em docs/wiki/ (ex.: ADRs)",
    )
    args = parser.parse_args(argv)

    problemas = verificar(args.wiki_dir, args.assets_dir, tuple(args.pagina_extra))
    for problema in problemas:
        print(problema, file=sys.stderr)
    if problemas:
        print(f"\n{len(problemas)} link(s) com problema", file=sys.stderr)
        return 1
    print(f"{args.wiki_dir}: todos os links resolvem")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
