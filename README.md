# AuraCare

AuraCare is a WhatsApp-first heart-failure monitoring and virtual-ward demonstration.

> Demonstration only. Not for diagnosis, prescribing or emergency use.

## Current status
Phase 1 demo foundation: typed domain model, provider interfaces, deterministic mock providers, fictional Arthur Pendleton seed data, documentation, and a patient-monitoring dashboard that derives UI state from append-only mock events. Conversation and queue routes remain placeholders.

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
- Messaging intake webhook exists at `/api/webhooks/messaging`; no WhatsApp outbound live delivery is implemented yet.
- No database connection is implemented yet.
- Developer demo controls are available at `/developer` for the scripted Arthur flow.
- Clinician queue and conversation screens are placeholders.
- Scale-image extraction is deterministic in mock mode and requires confirmation before a reading is recorded.
- Call permission, mock call orchestration, the constrained Aura voice assessment script and a mock Server-Sent Events analysis stream and explainable demo risk engine and clinician evidence-review queue are implemented for the deterministic Arthur scenario.
- Clinical analysis is simulated and not validated for clinical use.


## Phase 9 governance controls
Consent, privacy, media retention, safety-branch, redaction and append-only audit controls are documented in `docs/PRIVACY_MODEL.md`, `docs/THREAT_MODEL.md`, `docs/CLINICAL_SAFETY_LIMITATIONS.md`, `docs/DATA_RETENTION.md` and `docs/INCIDENT_RESPONSE.md`.
