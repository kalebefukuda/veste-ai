class DomainError(Exception):
    """Base for business rule violations. Routers are the only layer that maps these to HTTP."""

    code = "DOMAIN_ERROR"
    detail = "Não foi possível concluir a operação"


class EmailAlreadyRegistered(DomainError):
    code = "EMAIL_ALREADY_REGISTERED"
    detail = "Este e-mail já está cadastrado"


class InvalidCredentials(DomainError):
    code = "INVALID_CREDENTIALS"
    detail = "E-mail ou senha incorretos"


class DomainHTTPException(Exception):
    """Carrega a exceção de domínio até o handler, que monta o corpo padrão da API."""

    def __init__(self, status_code: int, error: DomainError) -> None:
        self.status_code = status_code
        self.error = error
