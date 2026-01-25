from fastapi import UploadFile

from app.models.schemas import ResumeAnalysisResponse, SkillInsight


class ResumeService:
    def extract_text_from_pdf(self, file: UploadFile) -> str:
        # TODO(Gemini): Replace with PDF parsing + Gemini summarization.
        return (
            "Mock extracted text from resume PDF. "
            "Focus areas: backend APIs, data modeling, and AI integrations."
        )

    def analyze_resume(self, text: str) -> ResumeAnalysisResponse:
        # TODO(Gemini): Replace with LLM-driven skill intelligence pipeline.
        return ResumeAnalysisResponse(
            summary="Strong backend fundamentals with emerging AI exposure.",
            skills=[
                SkillInsight(skill="Python", score=86),
                SkillInsight(skill="FastAPI", score=80),
                SkillInsight(skill="SQL", score=72),
                SkillInsight(skill="Cloud", score=60),
            ],
            strengths=["API design", "Data modeling", "Problem solving"],
            improvement_areas=["Cloud architecture", "LLM orchestration"],
        )
