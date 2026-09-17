import logging

import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

ENDPOINT = "https://safebrowsing.googleapis.com/v4/threatMatches:find"
TIMEOUT = 4.0

AMEACAS = [
    "MALWARE",
    "SOCIAL_ENGINEERING",
    "UNWANTED_SOFTWARE",
    "POTENTIALLY_HARMFUL_APPLICATION",
]


# Lista de bloqueados, não de permitidos: loja pequena e desconhecida não é loja
# maliciosa, e uma lista de permitidos mataria a cauda longa que é o produto.
def e_perigoso(url: str) -> bool:
    chave = get_settings().safe_browsing_api_key

    if not chave:
        logger.debug("SAFE_BROWSING_API_KEY ausente: link aceito sem consulta")
        return False

    corpo = {
        "client": {"clientId": "vesteai", "clientVersion": "0.1.0"},
        "threatInfo": {
            "threatTypes": AMEACAS,
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}],
        },
    }

    try:
        resposta = httpx.post(ENDPOINT, params={"key": chave}, json=corpo, timeout=TIMEOUT)
        resposta.raise_for_status()
    except httpx.HTTPError as erro:
        # Falha aberta: o Google fora do ar não pode derrubar o cadastro de peça por
        # um motivo que não é nosso nem de quem monta o look — ADR-0022.
        logger.warning("Safe Browsing indisponível, link aceito sem consulta: %s", erro)
        return False

    return bool(resposta.json().get("matches"))
