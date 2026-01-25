from app.models.schemas import GapAnalysisItem, GapAnalysisResponse, RoleSelectRequest


_selected_role: RoleSelectRequest | None = None


class SkillService:
    def set_selected_role(self, role: RoleSelectRequest) -> RoleSelectRequest:
        global _selected_role
        _selected_role = role
        return role

    def get_selected_role(self) -> RoleSelectRequest | None:
        return _selected_role

    def build_gap_analysis(self) -> GapAnalysisResponse:
        # TODO(Gemini): Replace with role-specific skill gap reasoning.
        role_title = _selected_role.role_title if _selected_role else "Software Engineer"
        gaps = [
            GapAnalysisItem(skill="System Design", current_level=55, target_level=80, gap=25),
            GapAnalysisItem(skill="Cloud Infrastructure", current_level=40, target_level=75, gap=35),
            GapAnalysisItem(skill="ML Ops", current_level=35, target_level=65, gap=30),
        ]
        return GapAnalysisResponse(
            role_title=role_title,
            gaps=gaps,
            priority_skills=["Cloud Infrastructure", "System Design"],
        )
