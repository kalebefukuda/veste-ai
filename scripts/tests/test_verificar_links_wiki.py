from pathlib import Path

from verificar_links_wiki import verificar

RAW = "https://raw.githubusercontent.com/kalebefukuda/veste-ai/dev/docs/assets"


def montar(
    tmp_path: Path, paginas: dict[str, str], assets: tuple[str, ...] = ()
) -> tuple[Path, Path]:
    wiki = tmp_path / "wiki"
    wiki.mkdir()
    for nome, conteudo in paginas.items():
        (wiki / nome).write_text(conteudo, encoding="utf-8")
    pasta_assets = tmp_path / "assets"
    pasta_assets.mkdir()
    for asset in assets:
        destino = pasta_assets / asset
        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_bytes(b"")
    return wiki, pasta_assets


def test_pagina_sem_problema_passa(tmp_path: Path) -> None:
    wiki, assets = montar(
        tmp_path,
        {
            "Home.md": "# Home\n\n- [[Como-rodar-localmente]]\n",
            "Como-rodar-localmente.md": f"# Como rodar\n\n![C4]({RAW}/c4-model/level-1.png)\n",
        },
        assets=("c4-model/level-1.png",),
    )

    assert verificar(wiki, assets) == []


def test_link_relativo_e_erro_porque_a_wiki_e_outro_repositorio(tmp_path: Path) -> None:
    wiki, assets = montar(tmp_path, {"Home.md": "![DER](assets/der.png)\n"})

    problemas = verificar(wiki, assets)

    assert len(problemas) == 1
    assert "Home.md" in problemas[0]
    assert "assets/der.png" in problemas[0]
    assert "relativo" in problemas[0]


def test_link_relativo_subindo_pasta_tambem_e_erro(tmp_path: Path) -> None:
    wiki, assets = montar(tmp_path, {"Home.md": "![Casos](../docs/assets/casos.png)\n"})

    assert len(verificar(wiki, assets)) == 1


def test_asset_inexistente_no_repositorio_e_erro(tmp_path: Path) -> None:
    wiki, assets = montar(
        tmp_path, {"Home.md": f"![X]({RAW}/nao-existe.png)\n"}, assets=("existe.png",)
    )

    problemas = verificar(wiki, assets)

    assert len(problemas) == 1
    assert "nao-existe.png" in problemas[0]


def test_wikilink_para_pagina_que_nao_existe_e_erro(tmp_path: Path) -> None:
    wiki, assets = montar(tmp_path, {"Home.md": "- [[Pagina-Fantasma]]\n"})

    problemas = verificar(wiki, assets)

    assert len(problemas) == 1
    assert "Pagina-Fantasma" in problemas[0]


def test_wikilink_para_pagina_gerada_pelo_pipeline_e_aceito(tmp_path: Path) -> None:
    wiki, assets = montar(tmp_path, {"Home.md": "- [[ADRs]]\n"})

    assert verificar(wiki, assets, paginas_extra=("ADRs",)) == []


def test_url_externa_nao_e_verificada_offline(tmp_path: Path) -> None:
    wiki, assets = montar(tmp_path, {"Home.md": "[Playbook](https://github.com/CatolicaSC-Portfolio)\n"})

    assert verificar(wiki, assets) == []


def test_ancora_na_mesma_pagina_nao_e_link_relativo(tmp_path: Path) -> None:
    wiki, assets = montar(tmp_path, {"Home.md": "[Escopo](#escopo)\n\n## Escopo\n"})

    assert verificar(wiki, assets) == []


def test_reporta_todos_os_problemas_e_nao_para_no_primeiro(tmp_path: Path) -> None:
    wiki, assets = montar(
        tmp_path,
        {
            "Home.md": "![A](a.png)\n![B](b.png)\n",
            "Outra.md": "- [[Nao-Existe]]\n",
        },
    )

    assert len(verificar(wiki, assets)) == 3
