# Solution

## What I built

A Daily Check-In web app.

- Users sign up with their email.
- The backend sends a Daily Check-In email containing a token link (sent via Mailpit for local testing).
- Opening the link takes the user to an interactive 4-step check-in flow:
  - Breathe (acknowledge completion)
  - Reflect
  - Gratitude
  - Intention
- Submissions are persisted in SQLite and shown on subsequent visits to the same token link.

## Decisions and trade-offs

- **Single Node app (Express + built React)**: The Express server serves the React production build and exposes a small JSON API.
- **SQLite for persistence**: One local `checkin.sqlite` file for check-in sessions and responses (simple + fast for a technical test).
- **Token links with UUID**: Token is a `crypto.randomUUID()` stored in SQLite; accessing `/checkin/:token` loads session state.
- **Mailpit + Nodemailer**: Uses local SMTP so delivery can be verified without external email providers.
- **Minimal frontend state**: The hook fetches the session, the UI stores responses in component state, and only submits at the end.

## Accessibility

- Uses semantic form controls (`label` + `id`, `textarea`, `role="alert"` for error/status messaging).
- Clear visible step headings ("Breathe", "Reflect", "Gratitude", "Intention").
- Buttons are disabled when required fields are missing to prevent accidental submission.

## If I had more time

- Add "resend token" and email verification/error recovery flows.
- Add partial saving (autosave per step) and a timer/guide for the breathing step.
- Add better API validation messages and more detailed client error states (e.g., expired link UI with a "start again" action).
- Add automated tests for the API routes and the frontend check-in submission flow.

## AI usage

Used an AI-assisted coding workflow for scaffolding and implementation (backend routes, frontend components, and glue code).

