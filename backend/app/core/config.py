from pydantic import BaseModel


class Settings(BaseModel):
    app_name: str = "Skill Intelligence API"
    app_version: str = "0.1.0"
    cors_allow_origins: list[str] = ["http://localhost:3000"]


settings = Settings()
