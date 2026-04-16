import crypto from "crypto";
import express from "express";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { sendCheckInEmail } from "./email.js";
import type { ApiErrorBody } from "./types.js";
import { isCheckInResponses, isValidEmail } from "./validate.js";
import {
  createCheckInSession,
  getCheckInSessionByToken,
  initDb,
  submitCheckInResponses,
} from "./repository.js";

type SignupRequestBody = { email: string };

function isSignupRequestBody(input: unknown): input is SignupRequestBody {
  if (typeof input !== "object" || input === null) {
    return false;
  }
  const record = input as Record<string, unknown>;
  return typeof record.email === "string" && isValidEmail(record.email);
}

function toApiErrorBody(message: string): ApiErrorBody {
  return { error: message };
}

function mapErrorToHttpStatus(error: unknown): number {
  if (!(error instanceof Error)) {
    return 500;
  }

  const msg = error.message.toLowerCase();
  if (msg.includes("expired")) {
    return 410;
  }
  if (msg.includes("not found")) {
    return 404;
  }
  if (msg.includes("already completed")) {
    return 409;
  }
  if (msg.includes("invalid")) {
    return 400;
  }

  return 500;
}

function getEnvNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const app = express();
app.use(express.json({ limit: "64kb" }));

app.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true });
});

const port = getEnvNumber("PORT", 3000);
const nodeEnv = process.env.NODE_ENV ?? "development";

const publicBaseUrl = process.env.PUBLIC_BASE_URL ?? `http://localhost:${port}`;
const dbPath =
  process.env.DATABASE_PATH ?? path.resolve(process.cwd(), "data", "checkin.sqlite");

// Ensure the directory exists before opening the SQLite file.
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const smtpHost = process.env.SMTP_HOST ?? "mailpit";
const smtpPort = getEnvNumber("SMTP_PORT", 1025);
const smtpFrom = process.env.SMTP_FROM ?? "checkin@example.com";
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

// Database init (create tables on startup).
const db = new Database(dbPath);
initDb(db);

app.post("/api/check-ins/signup", async (req, res) => {
  const body: unknown = req.body;
  if (!isSignupRequestBody(body)) {
    res.status(400).json(toApiErrorBody("Invalid email"));
    return;
  }

  const createdAtIso = new Date().toISOString();
  const expiresAtIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const token = crypto.randomUUID();

  createCheckInSession(db, {
    token,
    email: body.email,
    createdAt: createdAtIso,
    expiresAt: expiresAtIso,
  });

  try {
    await sendCheckInEmail({
      toEmail: body.email,
      token,
      publicBaseUrl,
      smtpHost,
      smtpPort,
      smtpFrom,
      smtpUser,
      smtpPass,
    });
  } catch (error) {
    res
      .status(500)
      .json(toApiErrorBody(error instanceof Error ? error.message : "Email failed"));
    return;
  }

  // Return token for easier testing/debugging. Email link is the real integration.
  res.status(201).json({ token, expiresAt: expiresAtIso });
});

app.get("/api/check-ins/session/:token", (req, res) => {
  const token = req.params.token;
  const session = getCheckInSessionByToken(db, token);

  if (!session) {
    res.status(404).json(toApiErrorBody("Check-in session not found"));
    return;
  }

  if (session.expiresAt < new Date().toISOString()) {
    res.status(410).json(toApiErrorBody("Check-in link expired"));
    return;
  }

  res.status(200).json(session);
});

app.post("/api/check-ins/session/:token/submit", (req, res) => {
  const token = req.params.token;
  const body: unknown = req.body;

  if (!isCheckInResponses(body)) {
    res.status(400).json(toApiErrorBody("Invalid responses payload"));
    return;
  }

  try {
    const session = submitCheckInResponses(db, token, body);
    res.status(200).json(session);
  } catch (error) {
    const status = mapErrorToHttpStatus(error);
    res.status(status).json(toApiErrorBody(error instanceof Error ? error.message : "Submit failed"));
  }
});

if (nodeEnv === "production") {
  const distDir = path.resolve(process.cwd(), "dist");
  const indexHtmlPath = path.join(distDir, "index.html");

  app.use(express.static(distDir));

  // SPA fallback (token route is handled client-side).
  app.get(/.*/, (_req, res) => {
    res.sendFile(indexHtmlPath);
  });
}

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

