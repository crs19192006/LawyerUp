export type User = {
  id: string;
  name: string;
  email: string;
  role: "client" | "lawyer" | "student";
  verified: boolean;
};

export type CaseStatus =
  | "Created"
  | "Accepted"
  | "In Progress"
  | "Hearing Updates"
  | "Closed";

export type CaseComplexity = "Low" | "Medium" | "High";

export type Case = {
  id: string;
  clientId: string;
  title: string;
  description: string;
  category: string;
  difficultyScore: number;
  complexityTag: CaseComplexity;
  status: CaseStatus;
  assignedLawyerId?: string;
  createdAt: string;
};

export type CaseDocument = {
  id: string;
  caseId: string;
  fileUrl: string;
  uploadedBy: string;
  timestamp: string;
};

export type CaseTimeline = {
  id: string;
  caseId: string;
  status: CaseStatus;
  note: string;
  timestamp: string;
};
