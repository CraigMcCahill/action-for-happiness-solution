# Daily Check-In Solution

## How to run

### With Docker (recommended for review)

- Ensure Docker is running.
- From the project root:
  - `docker compose up --build`
- App: <http://localhost:3001>
- Mailpit (email inbox): <http://localhost:8025>

### Local development (with hot reload)

- Install dependencies: `npm install`
- Run dev servers: `npm run dev`
  - Frontend (Vite): <http://localhost:5173>
  - API: <http://localhost:3000> (proxied from Vite for `/api`)

---

## What I built

A simple end-to-end Daily Check-In system.

- Users sign up with their email.
- On sign-up, the backend sends a Check-In email containing a tokenised link (via Mailpit for local testing).
- Opening the link takes the user to an interactive 4-step check-in flow:
  1. **Breathe** — pause and acknowledge a moment of calm
  2. **Reflect** — how they are feeling
  3. **Gratitude** — what they are grateful for
  4. **Intention** — one positive action for the day

- Users can submit their responses.
- Responses are persisted in SQLite and reloaded when the same token link is revisited.

The focus was on delivering a complete, usable flow within the time constraint.

---

## Technical approach

- **Single Node app (Express + React build)**

  Express serves the React production build and exposes a small JSON API.

- **SQLite for persistence**

  A single local database (`checkin.sqlite`) stores users, tokens, and responses. This keeps setup minimal and the system easy to run locally.

- **Token-based access (UUID)**

  Each sign-up generates a `crypto.randomUUID()` token stored in SQLite. The `/checkin/:token` route loads and updates the associated session.

- **Email delivery via Mailpit + Nodemailer**

  Emails are sent using Nodemailer to a local SMTP service (Mailpit), allowing easy verification without external dependencies.

- **Minimal frontend state**

  The frontend fetches session data once, manages form state locally, and submits responses at the end of the flow.

---

## Trade-offs

- **Immediate email on sign-up vs recurring delivery**

  I prioritised a complete end-to-end experience (sign up → receive email → complete check-in) over implementing scheduled daily emails. With more time, I would add a recurring delivery mechanism (e.g. cron or a job queue).

- **Simple architecture over full framework setup**

  I avoided a full NestJS/Prisma setup to reduce overhead and focus on delivering a working system within 90 minutes.

- **Single submission at the end**

  Responses are submitted once at the end rather than saved per step, which simplifies the data flow but sacrifices resilience if the session is interrupted.

---

## Limitations

This is intentionally a minimal implementation and not production-ready.

- Email delivery is triggered on sign-up rather than scheduled daily.
- Token links do not expire and are not tied to authenticated user sessions.
- Validation and abuse protection are minimal (no rate limiting or bot protection).
- SQLite is suitable for local/small-scale usage but would not scale for production.
- Progress is not saved between steps — closing the page mid-flow would lose input.

In a production system, I would prioritise improving token security, adding recurring scheduling, strengthening validation, and introducing observability.

---

## Accessibility

I aimed for a simple, accessible baseline:

- Semantic HTML form controls with associated labels
- Keyboard-accessible inputs and buttons
- Clear step headings and structure
- Basic status/error messaging

With more time, I would improve focus management between steps and test the flow with screen readers.

---

## If I had more time

- Implement scheduled daily email delivery
- Add autosave per step to prevent data loss
- Improve validation and error handling
- Add link expiry and better token security
- Introduce automated tests (API + core user flow)
- Refine the breathing step with timing or gentle guidance

---

## AI usage

I used ChatGPT for planning the solution and thinking through trade-offs, and Cursor as an AI-assisted coding environment.

AI was most useful for:

- scaffolding Express routes and React components
- wiring up Mailpit/Nodemailer integration
- generating initial boilerplate and repetitive code

I reviewed and adjusted all generated code. In particular, I refined the architecture to keep the solution small and focused, and adapted generated code to fit the final data flow and user experience.
