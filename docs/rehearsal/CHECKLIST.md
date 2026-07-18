# AuraCare Stage Rehearsal Checklist

AuraCare is a demonstration only. Not for diagnosis, prescribing or emergency use.

## Before going on stage
- Set `AURACARE_DEMO_MODE=fully_simulated` unless the WhatsApp/Twilio path has been verified that day.
- Open `/developer` on the operator laptop and keep it off the pitch screen.
- Open `/patients/arthur-pendleton` and `/queue` on the projected display.
- Confirm the prepared scale photo shows 79.8 kg.
- Run health and readiness checks: `/api/health`, `/api/ready`, and authorised `/api/diagnostics/provider`.
- Disable OS notification popups and browser password/debug overlays.

## Exact story to rehearse
WhatsApp scale photo → checking response → confirm 79.8 kg → call permission → call answered → scripted Aura questions → live dashboard update → high Demo deterioration risk signal → Immediate review queue → simulated intervention → scheduled follow-up → completed intercept outcome.

## Recovery
If a provider fails, do not show false success. Use the protected operator panel to switch to labelled backup simulation mode, replay analysis, skip call, or restore Arthur seed data.
