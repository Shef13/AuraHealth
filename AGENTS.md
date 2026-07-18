# AuraCare Repository Guide

## Product mission
AuraCare is a WhatsApp-first heart-failure monitoring and virtual-ward demonstration. It is a hackathon demo only: **Demonstration only. Not for diagnosis, prescribing or emergency use.**

## Architecture overview
Next.js App Router, React, strict TypeScript, Tailwind CSS, Zod configuration, mock-first provider adapters, and PostgreSQL-compatible domain modelling. Application code must depend on internal provider interfaces, never directly on Twilio, OpenAI, Supabase, or other SDK types.

## Important directories
- `src/app`: App Router routes and UI shell.
- `src/components`: Shared presentational components.
- `src/lib/domain`: Core domain and event types.
- `src/lib/providers`: Messaging, vision, voice, and clinical-analysis provider contracts and mocks.
- `src/lib/demo`: Fictional deterministic seed data.
- `src/lib/intake`: Messaging webhook parsing, idempotency, patient matching, and normalised event creation.
- `docs`: Architecture, product flow, and demo scenario notes.

## Commands
- `npm run dev`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

## Testing requirements
Run lint, type-check, unit tests, and build before handing off code changes. Add Vitest coverage for domain/config logic and Playwright only for critical end-to-end flows once screens become functional.

## Mock-versus-live provider rules
Mock mode must make no external network calls and must produce deterministic results. Live mode is activated only through environment variables. Missing live credentials must produce clear errors; never silently fall back from live mode to mock mode.

## Clinical-safety language
Use: "Possible deterioration signal", "Demo risk assessment", "Requires clinician review", "Simulated recommendation", and "Clinician decision required". Do not diagnose deterioration as fact, change medication automatically, instruct medication changes, display the NHS logo, or claim NHS approval.

## Accessibility requirements
Use semantic HTML, visible focus states, sufficient colour contrast, keyboard-accessible navigation, and clear non-colour status text.

## Data-handling principles
Commit only fictional demo data. Never commit secrets or real patient data. Store media metadata and storage references, not image binaries, in database rows. Keep raw provider payloads separate from normalised events and clinician-facing summaries.

## Definition of done
The app runs locally; lint, type-check, tests, and build have been run; mock/live boundaries remain explicit; clinical safety language is present; docs are updated; no screen falsely appears fully functional.

## Deeper documents
- `docs/ARCHITECTURE.md`
- `docs/PRODUCT_FLOW.md`
- `docs/DEMO_SCENARIO.md`
