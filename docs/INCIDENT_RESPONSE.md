# Incident Response

## Implemented prototype controls
- Emergency wording explicitly says AuraCare has not contacted emergency services unless a real integration confirms it.
- Audit events include actor, action, patient, timestamp, source, previous state, new state, relevant event IDs and request/correlation ID.
- Missing clinician review is treated as a safety branch that requires human review before simulated recommendations.

## Future production requirements
- On-call rota, incident severity matrix, breach notification process and rehearsed runbooks.
- Production monitoring, immutable audit storage, backup restore testing and regulator-facing reporting procedures.
