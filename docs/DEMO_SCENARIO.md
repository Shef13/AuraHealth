# Deterministic Arthur Scenario

Arthur Pendleton is a fictional 82-year-old patient in Leeds with HFrEF. His fictional dry weight is 78.0 kg and current medication is Furosemide 40 mg. The placeholder phone number `+440000000000` is fictional.

Seeded weights are stable: 77.8, 78.1, 78.0, 78.2, 78.4, 79.1, and 80.2 kg.

Mock provider behaviour:
- Messaging accepts outbound text and interactive messages deterministically.
- Media download returns a tiny mock JPEG byte array and fixed hash.
- Vision extraction returns 80.2 kg with 0.91 confidence.
- Voice permission is granted and a call completes immediately.
- Clinical analysis returns a demo risk assessment labelled possible deterioration signal and requires clinician review.

This scenario supports rehearsal without external network calls or real patient data.
