# AuraCare

AuraCare is a WhatsApp-first heart-failure monitoring and virtual-ward demonstration.

> Demonstration only. Not for diagnosis, prescribing or emergency use.

## Current status
Phase 0 repository foundation: typed domain model, provider interfaces, deterministic mock providers, fictional Arthur Pendleton seed data, documentation, and a minimal Next.js UI shell. Placeholder routes are intentionally not functional.

## Setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Commands
```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Environment variables
Default local demo mode:
```text
AURACARE_MODE=mock
DATABASE_PROVIDER=memory
MESSAGING_PROVIDER=mock
VISION_PROVIDER=mock
VOICE_PROVIDER=mock
```

Live mode requires explicit live providers and credentials. The application must not silently fall back to mock mode.

## Current limitations
- No provider webhooks are implemented yet.
- No database connection is implemented yet.
- Developer demo controls are a placeholder.
- Clinician queue and conversation screens are placeholders.
- Clinical analysis is simulated and not validated for clinical use.
