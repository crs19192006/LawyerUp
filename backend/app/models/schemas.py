from typing import List, Optional

from pydantic import BaseModel, Field


class ResumeUploadResponse(BaseModel):
    extracted_text: str
    filename: str
    size_kb: float


class SkillInsight(BaseModel):
    skill: str
    score: int = Field(..., ge=0, le=100)


class ResumeAnalysisResponse(BaseModel):
    summary: str
    skills: List[SkillInsight]
    strengths: List[str]
    improvement_areas: List[str]


class RoleSelectRequest(BaseModel):
    role_id: str
    role_title: str
    level: Optional[str] = None


class RoleSelectResponse(BaseModel):
    status: str
    selected_role: RoleSelectRequest


class GapAnalysisItem(BaseModel):
    skill: str
    current_level: int = Field(..., ge=0, le=100)
    target_level: int = Field(..., ge=0, le=100)
    gap: int = Field(..., ge=0, le=100)


class GapAnalysisResponse(BaseModel):
    role_title: str
    gaps: List[GapAnalysisItem]
    priority_skills: List[str]


class RoadmapRequest(BaseModel):
    role_title: str
    focus_skills: List[str]


class RoadmapWeek(BaseModel):
    week: int
    theme: str
    outcomes: List[str]


class RoadmapResponse(BaseModel):
    role_title: str
    duration_weeks: int
    weeks: List[RoadmapWeek]


class InterviewStartRequest(BaseModel):
    role_title: str
    difficulty: Optional[str] = "mid"


class InterviewQuestion(BaseModel):
    question: str
    category: str


class InterviewStartResponse(BaseModel):
    role_title: str
    questions: List[InterviewQuestion]
