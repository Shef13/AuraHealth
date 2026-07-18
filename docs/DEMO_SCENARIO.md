# Deterministic Arthur Scenario

Arthur Pendleton is a fictional 82-year-old patient in Leeds with HFrEF. His fictional dry weight is 78.0 kg and current medication is Furosemide 40 mg. The placeholder phone number `+440000000000` is fictional.

Seeded weights are stable: 77.8, 78.1, 78.0, 78.2, 78.1, 78.0, and 78.2 kg.

Phase 1 screen behaviour:
- The patient route `/patients/arthur-pendleton` presents the stage-safe monitoring dashboard without controls.
- The development-only route `/developer` presents the same dashboard with demo controls.
- Demo control events are append-only and persisted in browser local storage for ordinary component rerenders.
- Reset clears appended events and returns to Arthur’s seeded baseline.

Scripted controls:
1. Receive scale image.
2. Complete weight extraction.
3. Confirm weight.
4. Grant call permission.
5. Start call.
6. Record breathlessness answer.
7. Record swelling answer.
8. Record dizziness answer.
9. Complete risk analysis.
10. Create clinician alert.
11. Approve simulated intervention.
12. Reset demo.

Mock provider behaviour:
- Messaging accepts outbound text and interactive messages deterministically.
- Media download returns a tiny mock JPEG byte array and fixed hash.
- Vision extraction returns 80.2 kg with 0.91 confidence.
- Voice permission is granted and a call completes immediately.
- Clinical analysis returns a demo risk assessment labelled possible deterioration signal and requires clinician review.

This scenario supports rehearsal without external network calls or real patient data.
