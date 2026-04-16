import type { CheckInResponses } from "./types.js";

export function isValidEmail(email: string): boolean {
  // Simple but practical email check for the purposes of this technical assignment.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isCheckInResponses(input: unknown): input is CheckInResponses {
  if (typeof input !== "object" || input === null) {
    return false;
  }
  const record = input as Record<string, unknown>;

  return (
    typeof record.breatheCompleted === "boolean" &&
    typeof record.reflect === "string" &&
    typeof record.gratitude === "string" &&
    typeof record.intention === "string" &&
    typeof record.submittedAt === "string"
  );
}

