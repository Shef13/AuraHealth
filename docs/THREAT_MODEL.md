# AuraCare Threat Model

## Implemented prototype controls
- Webhook replay/idempotency is tested for provider message IDs and callback IDs.
- Live messaging callbacks require signature validation where supported by provider configuration.
- Media preview access is routed through an application endpoint and rejects unauthorised demo requests.
- Raw provider payload storage is opt-in for debugging and should carry a retention setting.
- Logging helpers redact phone numbers and avoid full transcript bodies.

## Key prototype threats
- In-memory stores reset on process restart and are not suitable for clinical audit durability.
- Demo authorization headers are not a production authentication mechanism.
- Rate-limiting hooks are documented boundaries, not a deployed edge protection layer.

## Future production requirements
- Authenticated clinician accounts, least-privilege service roles, WAF/rate limits and signed media URLs.
- Centralised secrets management, SIEM forwarding and penetration testing.
