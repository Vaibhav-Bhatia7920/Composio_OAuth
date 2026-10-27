import os
from enum import Enum
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI
from pydantic import BaseModel, Field
from tavily import AsyncTavilyClient

load_dotenv()
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app = FastAPI(title="Composio APM API")

cors_origins = os.getenv("CORS_ORIGINS")
allow_origins = (
    [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
    if cors_origins
    else DEFAULT_CORS_ORIGINS
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|\[::1\]|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DifficultyLevel(str, Enum):
    EASY = "Easy"
    MODERATE = "Moderate"
    HARD = "Hard"


class OAuthGuide(BaseModel):
    difficulty_level: DifficultyLevel
    estimated_time: str
    prerequisites_and_blockers: list[str]
    agent_automatable_steps: list[str]
    human_intervention_steps: list[str]


class GenerateGuideRequest(BaseModel):
    app_name: str = Field(..., min_length=1, description="Application or provider name")


OAUTH_GUIDE_SYSTEM_PROMPT = """You are an OAuth integration analyst. Given documentation excerpts, produce a structured setup guide.

Rules:
- Base every field only on the provided documentation context. If something is unclear, state reasonable assumptions briefly in prerequisites_and_blockers.
- difficulty_level: Easy (well-documented, standard OAuth2), Moderate (custom scopes, multiple consoles, or org policies), Hard (enterprise SSO, restricted APIs, manual approval, or sparse docs).
- estimated_time: A realistic human-readable range (e.g. "30–45 minutes").
- prerequisites_and_blockers: Accounts, roles, billing, verified domains, admin approval, API access requests, or missing public docs.
- agent_automatable_steps: Steps an API-driven agent can perform without a browser UI—e.g. REST calls to create apps, configure redirect URIs via API, rotate secrets via API, fetch metadata, validate token endpoints with HTTP. Do NOT put "log into developer console and click..." here unless an official API exists for that action.
- human_intervention_steps: Steps that require a human in a web UI, email verification, CAPTCHA, phone MFA, legal/compliance acceptance, manual review by the provider, copying secrets from a dashboard, or tasks with no documented API equivalent.

Keep steps concise, actionable, and ordered. No duplicate steps across agent and human lists."""


async def investigate_oauth_setup(app_name: str) -> str:
    query = f"{app_name} OAuth provider setup developer documentation"
    client = AsyncTavilyClient()
    response = await client.search(
        query=query,
        max_results=2,
        include_raw_content=True,
    )

    results = response.get("results", [])[:2]
    if not results:
        raise HTTPException(
            status_code=502,
            detail="No documentation found for the requested application.",
        )

    sections: list[str] = []
    for index, result in enumerate(results, start=1):
        title = result.get("title") or "Untitled"
        url = result.get("url") or ""
        raw_content = result.get("raw_content") or result.get("content") or ""
        sections.append(
            f"### Source {index}: {title}\nURL: {url}\n\n{raw_content.strip()}"
        )

    return "\n\n---\n\n".join(sections)


async def build_oauth_guide(app_name: str, documentation_context: str) -> OAuthGuide:
    openai_client = AsyncOpenAI()
    completion = await openai_client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": OAUTH_GUIDE_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Application: {app_name}\n\n"
                    f"Documentation excerpts:\n\n{documentation_context}"
                ),
            },
        ],
        response_format=OAuthGuide,
    )

    guide = completion.choices[0].message.parsed
    if guide is None:
        raise HTTPException(
            status_code=502,
            detail="Failed to parse OAuth guide from model response.",
        )
    return guide


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


def _configuration_error_message(exc: Exception) -> Optional[str]:
    message = str(exc).lower()
    if "openai" in message and ("api_key" in message or "credential" in message):
        return "OPENAI_API_KEY is not set. Add it to the project .env file."
    if "tavily" in message and "api" in message:
        return "TAVILY_API_KEY is not set. Add it to the project .env file."
    return None


@app.post("/api/v1/generate-guide", response_model=OAuthGuide)
async def generate_guide(request: GenerateGuideRequest) -> OAuthGuide:
    app_name = request.app_name.strip()
    try:
        documentation_context = await investigate_oauth_setup(app_name)
        return await build_oauth_guide(app_name, documentation_context)
    except HTTPException:
        raise
    except Exception as exc:
        config_hint = _configuration_error_message(exc)
        if config_hint:
            raise HTTPException(status_code=503, detail=config_hint) from exc
        raise HTTPException(
            status_code=502,
            detail="Failed to generate guide. Check server logs for details.",
        ) from exc
