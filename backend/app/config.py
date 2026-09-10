from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    frontend_origin: str = "http://localhost:3000"
    jwt_secret: str
    jwt_expiration_minutes: int = 60 * 24
    reset_token_expiration_minutes: int = 60
    brevo_api_key: str = ""
    email_sender: str = "nao-responda@vesteai.site"
    email_sender_name: str = "VesteAí"
    # Destino do canal do titular. Nunca aparece na interface: é o que permite ter
    # canal de contato sem publicar endereço nenhum.
    contact_destination: str = "privacidade@vesteai.site"
    frontend_reset_url: str = "http://localhost:3000/reset-password"
    rate_limit_storage: str = "memory://"
    env: str = "development"


@lru_cache
def get_settings() -> Settings:
    return Settings()
