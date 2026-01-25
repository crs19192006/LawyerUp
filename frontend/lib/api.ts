export type SkillInsight = {
  skill: string;
  score: number;
};

export type RoleOption = {
  id: string;
  title: string;
  level: string;
  summary: string;
};

export type GapItem = {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
};

export type RoadmapWeek = {
  week: number;
  theme: string;
  outcomes: string[];
};

export type InterviewQuestion = {
  question: string;
  category: string;
};

const mockSkills: SkillInsight[] = [
  { skill: "Python", score: 86 },
  { skill: "FastAPI", score: 80 },
  { skill: "SQL", score: 72 },
  { skill: "Cloud", score: 60 },
];

const mockRoles: RoleOption[] = [
  {
    id: "backend",
    title: "Backend Engineer",
    level: "Mid",
    summary: "Build scalable APIs and data services.",
  },
  {
    id: "fullstack",
    title: "Full-Stack Engineer",
    level: "Mid",
    summary: "Deliver end-to-end product experiences.",
  },
  {
    id: "ai",
    title: "AI Product Engineer",
    level: "Mid",
    summary: "Prototype AI features with strong product focus.",
  },
];

const mockGaps: GapItem[] = [
  { skill: "System Design", currentLevel: 55, targetLevel: 80, gap: 25 },
  { skill: "Cloud Infrastructure", currentLevel: 40, targetLevel: 75, gap: 35 },
  { skill: "ML Ops", currentLevel: 35, targetLevel: 65, gap: 30 },
];

const mockRoadmap: RoadmapWeek[] = [
  {
    week: 1,
    theme: "Foundational refresh",
    outcomes: ["Revisit core CS concepts", "Set learning goals"],
  },
  {
    week: 2,
    theme: "Backend depth",
    outcomes: ["Design scalable APIs", "Refine data models"],
  },
  {
    week: 3,
    theme: "Cloud and DevOps",
    outcomes: ["Practice IaC basics", "Deploy a service"],
  },
  {
    week: 4,
    theme: "AI readiness",
    outcomes: ["Review LLM tooling", "Prototype AI feature"],
  },
];

const mockQuestions: InterviewQuestion[] = [
  {
    question: "Design a scalable API for a skill analytics dashboard.",
    category: "system-design",
  },
  {
    question: "How would you structure a FastAPI service with clean separation of concerns?",
    category: "backend",
  },
  {
    question: "Explain a time you optimized a data pipeline.",
    category: "behavioral",
  },
];

export async function getSkillInsights(): Promise<SkillInsight[]> {
  return mockSkills;
}

export async function getRoleOptions(): Promise<RoleOption[]> {
  return mockRoles;
}

export async function getGapItems(): Promise<GapItem[]> {
  return mockGaps;
}

export async function getRoadmapWeeks(): Promise<RoadmapWeek[]> {
  return mockRoadmap;
}

export async function getInterviewQuestions(): Promise<InterviewQuestion[]> {
  return mockQuestions;
}
