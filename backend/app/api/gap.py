from fastapi import APIRouter, Depends

from app.models.schemas import GapAnalysisResponse
from app.services.skill_service import SkillService

router = APIRouter()


def get_skill_service() -> SkillService:
    return SkillService()


@router.get("/gap-analysis", response_model=GapAnalysisResponse)
async def gap_analysis(
    skill_service: SkillService = Depends(get_skill_service),
) -> GapAnalysisResponse:
    return skill_service.build_gap_analysis()
