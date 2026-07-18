# AuraCare Deployment Runbook

AuraCare remains a hackathon demonstration only. Not for diagnosis, prescribing or emergency use.

## Modes
- `fully_simulated`: offline rehearsal; mock WhatsApp, voice and analysis.
- `hybrid`: real WhatsApp intake with simulated voice and deterministic analysis.
- `live_integration`: real WhatsApp intake and configured live voice provider.
- `backup_simulation`: labelled fallback when a provider is unavailable.

## Required environment variables
- Common: `AURACARE_DEMO_MODE`, `AURACARE_MODE`, `DATABASE_PROVIDER`, `MESSAGING_PROVIDER`, `VISION_PROVIDER`, `VOICE_PROVIDER`, `AURACARE_REGION`, `MEDIA_RETENTION_DAYS`.
- Operator controls: `AURACARE_OPERATOR_TOKEN` for protected diagnostics/operator APIs.
- Hybrid/live WhatsApp: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`.
- Live vision/voice: provider-specific keys configured outside source control.

## Deploy and verify
1. Build with `npm run build`.
2. Start the app and verify `/api/health` returns `ok: true`.
3. Verify `/api/ready`; it returns `503` when a selected live provider is not configured.
4. Verify authorised `/api/diagnostics/provider` from the operator environment.
5. Rehearse the complete Arthur story once before audience presentation.

## Rollback and backup demo
If readiness fails during setup, change to `AURACARE_DEMO_MODE=backup_simulation` or use the operator control. Tell the presenter this is a labelled backup simulation, not a hidden successful live integration.
