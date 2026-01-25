from fastapi import APIRouter, Depends

from app.models.schemas import RoadmapRequest, RoadmapResponse
from app.services.roadmap_service import RoadmapService

router = APIRouter()


def get_roadmap_service() -> RoadmapService:
    return RoadmapService()


@router.post("/roadmap/generate", response_model=RoadmapResponse)
async def generate_roadmap(
    payload: RoadmapRequest,
    roadmap_service: RoadmapService = Depends(get_roadmap_service),
) -> RoadmapResponse:
    return roadmap_service.generate_roadmap(payload)
