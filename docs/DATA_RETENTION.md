# Data Retention

## Implemented prototype controls
- Media retention is configurable with `MEDIA_RETENTION_DAYS` and defaults to seven days.
- Scale images can be scheduled for deletion and marked deleted after extraction and confirmation.
- Database guidance stores media metadata and storage references, not image binaries, in rows.
- Development data can be reset through in-memory store reset helpers.

## Future production requirements
- Managed object-storage lifecycle rules, deletion verification, legal holds and patient-access workflows.
- Production retention schedules for audit, messages, transcripts, risk outputs and provider payload references.
