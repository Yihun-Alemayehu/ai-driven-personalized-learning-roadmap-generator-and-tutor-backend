from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    port: int = 3002
    redis_url: str = "redis://localhost:6379"

    # Tier 1 – Phi-4 Multimodal (optional, via ngrok tunnel from Kaggle)
    phi4_base_url: str = ""

    # Tier 2 – Ollama local model
    ollama_base_url: str = "http://host.docker.internal:11434"
    ollama_model: str = "qwen2.5:3b"

    # Tier 3 – Gemini API (last resort)
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    log_level: str = "INFO"


settings = Settings()
