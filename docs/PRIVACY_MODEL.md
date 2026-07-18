# AuraCare Privacy Model

AuraCare is a demonstration only. Not for diagnosis, prescribing or emergency use.

## Implemented prototype controls
- Separate consent records are modelled for WhatsApp communication, calls, scale-photo processing, health-response processing, care-team sharing and optional voice-feature research.
- Optional voice-feature research consent is not bundled into service consent.
- Communication opt-out blocks non-essential messaging and routes follow-up to clinician review.
- Phone numbers and transcript bodies have redaction helpers for ordinary logs.
- Provider IDs and media storage references remain separate from patient-facing IDs.

## Future production requirements
- Formal DPIA, lawful-basis assessment, processor agreements and patient-facing privacy notices.
- Role-based access control, encryption key management and production audit retention policy.
- Full consent UX with identity verification and signed policy-version records.
