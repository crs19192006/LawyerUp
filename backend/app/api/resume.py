from fastapi import APIRouter, Depends, File, UploadFile

from app.models.schemas import ResumeAnalysisResponse, ResumeUploadResponse
from app.services.resume_service import ResumeService

router = APIRouter()


def get_resume_service() -> ResumeService:
    return ResumeService()


@router.post("/resume/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    resume_service: ResumeService = Depends(get_resume_service),
) -> ResumeUploadResponse:
    extracted_text = resume_service.extract_text_from_pdf(file)
    size_kb = (file.size or 0) / 1024 if hasattr(file, "size") else 0.0
    return ResumeUploadResponse(
        extracted_text=extracted_text,
        filename=file.filename or "resume.pdf",
        size_kb=round(size_kb, 2),
    )


@router.get("/resume/analysis", response_model=ResumeAnalysisResponse)
async def analyze_resume(
    resume_service: ResumeService = Depends(get_resume_service),
) -> ResumeAnalysisResponse:
    # TODO(Gemini): Use extracted resume text and AI analysis.
    return resume_service.analyze_resume("mock resume text")
