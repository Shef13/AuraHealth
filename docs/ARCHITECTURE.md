# AuraCare Architecture

## System context
AuraCare demonstrates a WhatsApp-first journey for a fictional heart-failure virtual ward. A patient sends a scale image, confirms the extracted weight, grants call permission, completes a voice assessment, and a clinician reviews a demo risk assessment before sending follow-up.

Persistent safety statement: **Demonstration only. Not for diagnosis, prescribing or emergency use.**

## Component responsibilities
- Next.js App Router UI: patient-monitoring dashboard, development-only demo controls, conversation placeholder, and clinician queue placeholder.
- Route handlers (future): receive provider webhooks and convert raw payloads into normalised internal events.
- Provider adapters: encapsulate messaging, media download, vision extraction, voice calls, and clinical analysis.
- Domain layer: stable IDs, ISO timestamps, append-only journey events, typed entities, and pure event reduction for dashboard state.
- Data layer: memory provider for local demo and PostgreSQL-compatible schema for deployment.

## Provider adapter model
Application code uses `MessagingProvider`, `VisionProvider`, `VoiceProvider`, and `ClinicalAnalysisProvider`. Provider mode is either `mock` or `live`. Live implementations must validate credentials and fail clearly if configuration is incomplete. Internal code must not expose SDK-specific types.

## Event flow
`message.received` → `scale_image.received` → `weight.extraction_started` → `weight.extraction_completed` → `weight.confirmation_requested` → `weight.confirmed` → `call.permission_requested` → `call.permission_granted` → `call.started` → `call.question_asked` → `call.response_received` → `analysis.signal_detected` → `analysis.completed` → `alert.created` → `intervention.recorded` → `follow_up.scheduled`.

Events are append-only for the demo timeline. Patient-monitoring screen state is reduced from events rather than scattered booleans.

## Data storage model
Initial PostgreSQL-compatible tables: `patients`, `patient_consents`, `conversations`, `messages`, `media_assets`, `weight_readings`, `weight_extractions`, `call_permissions`, `call_sessions`, `assessment_responses`, `analysis_events`, `risk_assessments`, `clinical_alerts`, `interventions`, `follow_ups`, and `audit_events`.

Media rows store provider media ID, storage reference, MIME type, size, hash, creation timestamp, and retention/deletion status. Image binaries are not stored directly in database rows.

## Mock and live modes
Mock mode uses deterministic seeded data and mock providers with no external network calls. Live mode is enabled only with environment variables and must never silently fall back to mock providers.

## Security boundaries
Provider webhook payloads are raw inputs and must be validated before normalisation. Secrets stay in environment variables. Clinician summaries must be separated from raw provider payloads. All demo patient data is fictional.
