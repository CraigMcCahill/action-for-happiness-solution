import Database from "better-sqlite3";
import type { CheckInResponses, CheckInSession, CheckInSessionStatus } from "./types.js";

type SqliteDatabase = ReturnType<typeof Database>;

const STATUSES: CheckInSessionStatus[] = ["pending", "completed"];

function parseResponses(responsesJson: string | null): CheckInResponses | null {
  if (!responsesJson) {
    return null;
  }
  try {
    const parsed = JSON.parse(responsesJson) as unknown;
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const record = parsed as Record<string, unknown>;
    if (
      typeof record.breatheCompleted === "boolean" &&
      typeof record.reflect === "string" &&
      typeof record.gratitude === "string" &&
      typeof record.intention === "string" &&
      typeof record.submittedAt === "string"
    ) {
      return {
        breatheCompleted: record.breatheCompleted,
        reflect: record.reflect,
        gratitude: record.gratitude,
        intention: record.intention,
        submittedAt: record.submittedAt,
      };
    }

    return null;
  } catch {
    return null;
  }
}

function isValidStatus(status: string): status is CheckInSessionStatus {
  return STATUSES.includes(status as CheckInSessionStatus);
}

export function initDb(db: SqliteDatabase): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS checkin_sessions (
      token TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      status TEXT NOT NULL,
      completedAt TEXT,
      responsesJson TEXT
    );
  `);

  // Helpful index for token lookups (PK already covers it, but cheap and explicit).
  db.exec("CREATE INDEX IF NOT EXISTS idx_checkin_sessions_expiresAt ON checkin_sessions(expiresAt);");
}

export function getCheckInSessionByToken(
  db: SqliteDatabase,
  token: string,
): CheckInSession | null {
  const row = db
    .prepare(
      `
      SELECT token, email, createdAt, expiresAt, status, completedAt, responsesJson
      FROM checkin_sessions
      WHERE token = ?
    `,
    )
    .get(token) as
    | {
        token: string;
        email: string;
        createdAt: string;
        expiresAt: string;
        status: string;
        completedAt: string | null;
        responsesJson: string | null;
      }
    | undefined;

  if (!row) {
    return null;
  }
  if (!isValidStatus(row.status)) {
    return null;
  }

  return {
    token: row.token,
    email: row.email,
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
    status: row.status,
    completedAt: row.completedAt,
    responses: parseResponses(row.responsesJson),
  };
}

export function createCheckInSession(
  db: SqliteDatabase,
  params: {
    token: string;
    email: string;
    createdAt: string;
    expiresAt: string;
  },
): void {
  db.prepare(
    `
    INSERT INTO checkin_sessions (token, email, createdAt, expiresAt, status, completedAt, responsesJson)
    VALUES (?, ?, ?, ?, ?, NULL, NULL)
  `,
  ).run(params.token, params.email, params.createdAt, params.expiresAt, "pending" satisfies CheckInSessionStatus);
}

export function submitCheckInResponses(
  db: SqliteDatabase,
  token: string,
  responses: CheckInResponses,
): CheckInSession {
  const session = getCheckInSessionByToken(db, token);
  if (!session) {
    throw new Error("check-in session not found");
  }

  const nowIso = new Date().toISOString();
  if (session.expiresAt < nowIso) {
    throw new Error("check-in link expired");
  }

  if (session.status === "completed") {
    throw new Error("check-in already completed");
  }

  db.prepare(
    `
    UPDATE checkin_sessions
    SET status = ?, completedAt = ?, responsesJson = ?
    WHERE token = ?
  `,
  ).run("completed", nowIso, JSON.stringify(responses), token);

  const updated = getCheckInSessionByToken(db, token);
  if (!updated) {
    throw new Error("check-in session missing after update");
  }
  return updated;
}

