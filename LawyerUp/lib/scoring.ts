import { CaseComplexity } from "./models";

const KEYWORD_BONUS: Record<string, number> = {
  constitutional: 2,
  property: 2,
  injury: 2,
  contract: 1,
  bankruptcy: 2,
  ip: 2,
};

export function scoreCaseDescription(description: string): number {
  const baseScore = Math.ceil(description.length / 120);
  const lowered = description.toLowerCase();
  const keywordScore = Object.entries(KEYWORD_BONUS).reduce((total, [keyword, bonus]) => {
    return lowered.includes(keyword) ? total + bonus : total;
  }, 0);
  return Math.min(10, Math.max(1, baseScore + keywordScore));
}

export function getComplexityTag(score: number): CaseComplexity {
  if (score <= 3) {
    return "Low";
  }
  if (score <= 7) {
    return "Medium";
  }
  return "High";
}

export function getRequiredExperience(score: number): "Junior" | "Mid" | "Senior" {
  if (score >= 8) {
    return "Senior";
  }
  if (score >= 4) {
    return "Mid";
  }
  return "Junior";
}
