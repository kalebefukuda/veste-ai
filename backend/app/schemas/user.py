import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

# Endereços que a aplicação usa ou vai usar, e que ninguém pode tomar.
RESERVADOS = frozenset(
    {
        "admin",
        "api",
        "comecar",
        "configuracoes",
        "inicio",
        "login",
        "perfil",
        "privacidade",
        "register",
        "root",
        "sobre",
        "suporte",
        "vesteai",
    }
)


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    username: str | None = None
    email: EmailStr
    plan: str
    avatar: str | None = None
    bio: str | None = None
    onboarded_at: datetime | None = None
    intent: str | None = None


# Devolve tudo que a conta guarda sobre o titular, menos a senha: credencial não é
# dado a entregar, e exportá-la viraria vazamento com carimbo de conformidade.
class UserExport(UserOut):
    created_at: datetime


# A senha vai no corpo do DELETE em vez de num endpoint separado de conferência:
# rota cuja única função é dizer se a senha está certa é um oráculo de senha.
class DeleteMeIn(BaseModel):
    password: str


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"  # noqa: S105 — esquema do protocolo, não segredo


class UserUpdate(BaseModel):
    # `extra="forbid"` é o que devolve 422 se alguém tentar mandar plan ou password
    # por aqui: são fluxos próprios, com validação própria.
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(default=None, min_length=2, max_length=100)
    avatar: str | None = None
    bio: str | None = Field(default=None, max_length=500)
    # Literal e não str: valor livre viraria lixo no banco e quebraria a
    # ramificação do tour, que decide o que mostrar com base nesta coluna.
    intent: Literal["creator", "shopper"] | None = None
    # Vira endereço público: minúscula, dígito e sublinhado só. Hífen e ponto ficam
    # de fora para não confundir com separador de rota, e acento porque o endereço
    # precisa ser digitável por quem recebeu o link em qualquer teclado.
    username: str | None = Field(
        default=None, min_length=3, max_length=30, pattern=r"^[A-Za-z0-9_]+$"
    )

    @field_validator("username")
    @classmethod
    def handle_em_minuscula(cls, valor: str | None) -> str | None:
        if valor is None:
            return None

        minusculo = valor.lower()

        # O perfil público mora sob /perfil/<handle>; sem reservar, alguém registra
        # `configuracoes` e ocupa um endereço de que a aplicação precisa.
        if minusculo in RESERVADOS:
            raise ValueError("Este nome de usuário não está disponível")

        return minusculo

    # `users.name` é NOT NULL: sem esta guarda, mandar null viraria 500 no flush.
    # `avatar` e `bio` podem ser limpos de propósito.
    @model_validator(mode="after")
    def name_nao_pode_ser_nulo(self) -> "UserUpdate":
        if "name" in self.model_fields_set and self.name is None:
            raise ValueError("O nome não pode ficar vazio")

        return self


class ForgotPasswordIn(BaseModel):
    email: EmailStr


class ResetPasswordIn(BaseModel):
    token: str
    password: str = Field(min_length=8, max_length=128)
