import uuid

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    email: EmailStr
    plan: str
    avatar: str | None = None
    bio: str | None = None


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
