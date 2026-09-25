import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, File, Response, UploadFile, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.exceptions import (
    DomainHTTPException,
    ImageTooLarge,
    InvalidImage,
    LookNotFound,
    LookWithoutCategory,
    LookWithoutImage,
    LookWithoutPiece,
    NotTheOwner,
    StorageUnavailable,
    UnsafeLink,
)
from app.database import get_db
from app.models.look import Look
from app.models.user import User
from app.repositories.look_repository import LookRepository
from app.schemas.click import LookMetrics, PieceMetrics
from app.schemas.look import LookCreate, LookOut, LookUpdate, PieceCreate, PieceOut
from app.services import imagem
from app.services.click_service import ClickService
from app.services.look_service import LookService

router = APIRouter(prefix="/looks", tags=["looks"])


def get_look_service(db: Annotated[Session, Depends(get_db)]) -> LookService:
    return LookService(LookRepository(db))


def get_click_service(db: Annotated[Session, Depends(get_db)]) -> ClickService:
    return ClickService(LookRepository(db))


Servico = Annotated[LookService, Depends(get_look_service)]
Metricas = Annotated[ClickService, Depends(get_click_service)]
# RN01: toda rota daqui exige sessão. O feed público entra em rotas próprias.
Autenticado = Annotated[User, Depends(get_current_user)]


# Único ponto que traduz regra de domínio em HTTP; o serviço não conhece status code.
def _http(erro: Exception) -> DomainHTTPException:
    if isinstance(erro, LookNotFound):
        return DomainHTTPException(status.HTTP_404_NOT_FOUND, erro)
    if isinstance(erro, NotTheOwner):
        return DomainHTTPException(status.HTTP_403_FORBIDDEN, erro)
    # 503 e não 422: sem bucket configurado quem falhou foi a plataforma, não o envio.
    if isinstance(erro, StorageUnavailable):
        return DomainHTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, erro)
    return DomainHTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, erro)


def _look_out(look: Look) -> LookOut:
    saida = LookOut.model_validate(look)
    saida.image_url = imagem.endereco(look)

    return saida


@router.post("", status_code=status.HTTP_201_CREATED)
def criar(dados: LookCreate, user: Autenticado, service: Servico) -> LookOut:
    return _look_out(service.create(dados, user.id))


@router.get("")
def listar(user: Autenticado, service: Servico) -> list[LookOut]:
    return [_look_out(look) for look in service.list_mine(user.id)]


@router.get("/{look_id}")
def detalhe(look_id: uuid.UUID, user: Autenticado, service: Servico) -> LookOut:
    try:
        return _look_out(service.get_mine(look_id, user.id))
    except (LookNotFound, NotTheOwner) as erro:
        raise _http(erro) from erro


@router.patch("/{look_id}")
def editar(
    look_id: uuid.UUID, dados: LookUpdate, user: Autenticado, service: Servico
) -> LookOut:
    try:
        return _look_out(service.update(look_id, dados, user.id))
    except (LookNotFound, NotTheOwner, LookWithoutImage, LookWithoutCategory) as erro:
        raise _http(erro) from erro


@router.delete("/{look_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover(look_id: uuid.UUID, user: Autenticado, service: Servico) -> Response:
    try:
        service.delete(look_id, user.id)
    except (LookNotFound, NotTheOwner) as erro:
        raise _http(erro) from erro

    return Response(status_code=status.HTTP_204_NO_CONTENT)


# RN09: as métricas são do creator. A rota fica aqui, e não em /clicks, porque o
# recurso é o look — o clique é só como ele se mede.
@router.get("/{look_id}/metrics")
def metricas(look_id: uuid.UUID, user: Autenticado, service: Metricas) -> LookMetrics:
    try:
        look, por_peca, total = service.metrics(look_id, user.id)
    except (LookNotFound, NotTheOwner) as erro:
        raise _http(erro) from erro

    pecas = [
        PieceMetrics(id=p.id, name=p.name, clicks=por_peca.get(p.id, 0)) for p in look.pieces
    ]

    return LookMetrics(clicks=total, pieces=pecas)


@router.post("/{look_id}/image")
async def enviar_imagem(
    look_id: uuid.UUID,
    user: Autenticado,
    service: Servico,
    arquivo: Annotated[UploadFile, File()],
) -> LookOut:
    # Um byte a mais que o limite: se vier, já passou, e o resto não entra na memória
    # do processo. Medir depois de ler tudo deixa o cliente escolher quanto carregamos.
    conteudo = await arquivo.read(imagem.TAMANHO_MAXIMO + 1)

    try:
        if len(conteudo) > imagem.TAMANHO_MAXIMO:
            raise ImageTooLarge()

        look = service.set_image(look_id, conteudo, arquivo.content_type or "", user.id)
    except (
        LookNotFound,
        NotTheOwner,
        InvalidImage,
        ImageTooLarge,
        StorageUnavailable,
    ) as erro:
        raise _http(erro) from erro

    return _look_out(look)


@router.post("/{look_id}/pieces", status_code=status.HTTP_201_CREATED)
def adicionar_peca(
    look_id: uuid.UUID, dados: PieceCreate, user: Autenticado, service: Servico
) -> PieceOut:
    try:
        return PieceOut.model_validate(service.add_piece(look_id, dados, user.id))
    except (LookNotFound, NotTheOwner, UnsafeLink) as erro:
        raise _http(erro) from erro


@router.delete("/{look_id}/pieces/{piece_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_peca(
    look_id: uuid.UUID, piece_id: uuid.UUID, user: Autenticado, service: Servico
) -> Response:
    try:
        service.remove_piece(look_id, piece_id, user.id)
    except (LookNotFound, NotTheOwner, LookWithoutPiece) as erro:
        raise _http(erro) from erro

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{look_id}/publish")
def publicar(look_id: uuid.UUID, user: Autenticado, service: Servico) -> LookOut:
    try:
        return _look_out(service.publish(look_id, user.id))
    except (
        LookNotFound,
        NotTheOwner,
        LookWithoutPiece,
        LookWithoutImage,
        LookWithoutCategory,
    ) as erro:
        raise _http(erro) from erro
