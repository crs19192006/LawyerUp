from fastapi import APIRouter

from app.models.schemas import InterviewStartRequest, InterviewStartResponse, InterviewQuestion

router = APIRouter()


@router.post("/interview/start", response_model=InterviewStartResponse)
async def start_interview(payload: InterviewStartRequest) -> InterviewStartResponse:
    # TODO(Gemini): Replace with dynamic interview question generation.
    questions = [
        InterviewQuestion(
            question="Design a scalable API for a skill analytics dashboard.",
            category="system-design",
        ),
        InterviewQuestion(
            question="How would you structure a FastAPI service with clean separation of concerns?",
            category="backend",
        ),
        InterviewQuestion(
            question="Explain a time you optimized a data pipeline.",
            category="behavioral",
        ),
    ]
    return InterviewStartResponse(role_title=payload.role_title, questions=questions)
