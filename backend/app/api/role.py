from fastapi import APIRouter, Depends

from app.models.schemas import RoleSelectRequest, RoleSelectResponse
from app.services.skill_service import SkillService

router = APIRouter()


def get_skill_service() -> SkillService:
    return SkillService()


@router.post("/role/select", response_model=RoleSelectResponse)
async def select_role(
    payload: RoleSelectRequest,
    skill_service: SkillService = Depends(get_skill_service),
) -> RoleSelectResponse:
    selected = skill_service.set_selected_role(payload)
    return RoleSelectResponse(status="stored", selected_role=selected)
