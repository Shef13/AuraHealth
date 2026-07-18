# Clinical Safety Limitations

AuraCare is a hackathon demonstration only. Not for diagnosis, prescribing or emergency use.

## Implemented prototype controls
- UI copy uses Possible deterioration signal, Demo risk assessment, Requires clinician review, Simulated recommendation and Clinician decision required.
- Emergency symptoms bypass routine AI assessment and show configurable regional guidance.
- The demo risk engine is deterministic and transparent; it is not a validated clinical prediction model.
- Medication changes are not generated or sent by AuraCare.

## Future production requirements
- Clinical safety case, hazard log, clinical validation, regulated-device assessment and governance approval.
- Clinician workflow integration that confirms actual escalation and prescribing actions before messaging patients.
