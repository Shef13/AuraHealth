# Product Flow

WhatsApp image → weight extraction → patient confirmation → call permission → voice assessment → analysis → clinician review → intervention → follow-up.

1. Patient starts or resumes a WhatsApp conversation.
2. Patient sends a photograph of a weighing scale.
3. Messaging intake validates the webhook, matches the sender, records the inbound message, stores media metadata and queues weight extraction.
4. Vision extraction returns a validated candidate reading and asks the patient to confirm, retake, or enter weight manually.
5. Only explicit confirmation or manual entry creates a linked weight reading.
5. AuraCare asks permission to call.
6. Patient completes a short voice assessment.
7. AuraCare records a demo risk assessment and possible deterioration signal.
8. Clinician reviews the evidence and records an intervention.
9. AuraCare sends follow-up messaging after clinician review.

Safety copy must remain visible: **Demonstration only. Not for diagnosis, prescribing or emergency use.**
