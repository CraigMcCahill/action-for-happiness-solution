# Solution

## How to run

- With Docker (recommended for review):
  - Ensure Docker is running.
  - From the project root:
    - `docker compose up --build`
  - App: `http://localhost:3001`
  - Mailpit (email inbox): `http://localhost:8025`

- Local dev (with hot reload):
  - Install dependencies: `npm install`
  - Run dev servers: `npm run dev`
    - Vite dev server: `http://localhost:5173`
    - API runs on `http://localhost:3000` (proxied from Vite for `/api`)

## What I built

A Daily Check-In web app.

- Users sign up with their email.
- The backend sends today's Check-In email containing a token link (sent via Mailpit for local testing).
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

I used ChatGPT for solution planning and trade-off decisions, and Cursor for implementation assistance and code scaffolding.

AI was most useful for:

- quickly scaffolding Express routes and React component structure
- wiring the Mailpit/Nodemailer setup
- accelerating routine glue code

I reviewed and adjusted the generated code throughout. In particular, I refined the overall architecture to keep the solution small enough for the time limit, and I corrected/cleaned parts of the generated code to fit the final data flow and UX.
