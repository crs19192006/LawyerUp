from app.models.schemas import RoadmapRequest, RoadmapResponse, RoadmapWeek


class RoadmapService:
    def generate_roadmap(self, request: RoadmapRequest) -> RoadmapResponse:
        # TODO(Gemini): Replace with adaptive weekly roadmap generation.
        weeks = [
            RoadmapWeek(
                week=1,
                theme="Foundational refresh",
                outcomes=["Revisit core CS concepts", "Set learning goals"],
            ),
            RoadmapWeek(
                week=2,
                theme="Backend depth",
                outcomes=["Design scalable APIs", "Refine data models"],
            ),
            RoadmapWeek(
                week=3,
                theme="Cloud and DevOps",
                outcomes=["Practice IaC basics", "Deploy a service"],
            ),
            RoadmapWeek(
                week=4,
                theme="AI readiness",
                outcomes=["Review LLM tooling", "Prototype AI feature"],
            ),
        ]
        return RoadmapResponse(role_title=request.role_title, duration_weeks=4, weeks=weeks)
