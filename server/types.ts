export type CheckInSessionStatus = "pending" | "completed";

export type CheckInResponses = {
  breatheCompleted: boolean;
  reflect: string;
  gratitude: string;
  intention: string;
  submittedAt: string;
};

export type CheckInSession = {
  token: string;
  email: string;
  createdAt: string;
  expiresAt: string;
  status: CheckInSessionStatus;
  completedAt: string | null;
  responses: CheckInResponses | null;
};

export type ApiErrorBody = {
  error: string;
};

