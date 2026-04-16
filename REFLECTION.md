# Reflection

## Trade-offs

I chose a single Node app (Express API + built React frontend) rather than separate services. This kept the architecture small and easy to reason about in the 90-minute constraint and made Docker setup straightforward (one app container plus Mailpit). SQLite was a deliberate choice to avoid the overhead of running and configuring a separate database service while still modelling a real persistence layer; a single `checkin_sessions` table is enough to support token lookups and storing responses.

On the frontend, I kept the structure intentionally light: one custom hook for check-in session fetching/submission and a small number of focused components for the signup page and the stepper. I avoided more complex global state or routing libraries beyond React Router, trading flexibility for readability and speed. The email content is simple and text-first; a richer HTML design could improve user experience but would have taken more time to get right.

## Limitations

The biggest limitation is that the "Daily" aspect is not scheduled; the system sends an immediate Check-In email for today on sign-up rather than recurring scheduled emails. For a production system I would introduce a scheduler or job queue to send recurring check-ins and potentially track user preferences. The current SQLite schema is minimal and has no migrations or constraints beyond a primary key and a basic index; schema evolution and data integrity would need more attention in a real deployment.

Operationally, there is no authentication or rate limiting around the API endpoints, so a malicious client could create many check-in sessions and emails. Token handling is also fairly minimal: tokens are long UUIDs with an expiry window, but there is no revocation UI or self-service "resend" flow. On the frontend, the check-in experience is keyboard- and screen-reader-friendly in basic ways but lacks more advanced enhancements like focus management between steps and detailed error summaries.

## AI usage

I used AI-assisted coding for initial scaffolding (Vite/React/TypeScript/Tailwind setup, Express server, SQLite repository, and Docker/Mailpit wiring) and for iterating on the component and hook structure. I relied on the AI to propose sensible defaults for linting rules and TypeScript configuration, then adjusted where necessary (for example, tightening rules like `no-var`, `curly`, and quote style, and resolving TypeScript ESM/NodeNext issues for the server build). I also used it to quickly explore and fix environment-specific issues (such as Express catch-all routing and Docker port conflicts).

I had to manually verify and correct several AI-generated details, especially around TypeScript/ESM interop for the backend (`.js` import extensions, `better-sqlite3` typing, and the split build between client and server). I also tuned the flow and copy of the check-in steps to better match the brief and ensure a clear, linear user experience. Overall, AI significantly sped up boilerplate and wiring, but I still treated the output as a starting point that required review, simplification, and alignment with the assignment's constraints and readability goals.

