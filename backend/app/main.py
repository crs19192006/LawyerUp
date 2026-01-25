from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.resume import router as resume_router
from app.api.role import router as role_router
from app.api.gap import router as gap_router
from app.api.roadmap import router as roadmap_router
from app.api.interview import router as interview_router
from app.core.config import settings


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name, version=settings.app_version)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(resume_router, tags=["resume"])
    app.include_router(role_router, tags=["role"])
    app.include_router(gap_router, tags=["gap"])
    app.include_router(roadmap_router, tags=["roadmap"])
    app.include_router(interview_router, tags=["interview"])

    return app


app = create_app()
