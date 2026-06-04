export const CASE_CATEGORIES = [
  "Family Law",
  "Property",
  "Contract",
  "Personal Injury",
  "Constitutional",
  "IP",
  "Bankruptcy",
] as const;

export type CaseCategory = (typeof CASE_CATEGORIES)[number];
