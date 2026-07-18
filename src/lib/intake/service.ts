import type { AuraCareEvent, MediaAsset, Message, Patient } from "@/lib/domain/types";
import { findPatientByPhone } from "./patients";
import { hasConsent } from "@/lib/governance/consent";
import { scheduleMediaDeletion } from "@/lib/governance/media";
import type { IntakeOutcomeCode, IntakeRecord, IntakeStore, NormalisedInboundMedia, NormalisedInboundMessage } from "./types";

export const acceptedImageMimeTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const maxWebhookUploadBytes = 5 * 1024 * 1024;
export const acceptedImageResponse = "Thanks, Arthur. I’ve received your scale photo and I’m checking the reading now.";

export interface IntakeOptions {
  store: IntakeStore;
  now?: () => string;
}

export function processInboundMessage(input: NormalisedInboundMessage, options: IntakeOptions): IntakeRecord {
  if (options.store.hasProviderMessage(input.providerMessageId)) {
    return { providerMessageId: input.providerMessageId, mediaAssets: [], events: [], outcome: "duplicate", safeResponse: "Thanks — I already have this message." };
  }

  const patient = findPatientByPhone(input.from);
  if (!patient) return save(options.store, { providerMessageId: input.providerMessageId, mediaAssets: [], events: [], outcome: "unknown_sender", safeResponse: "Thanks for contacting AuraCare. Please contact the demo team for enrolment or support." });
  if (!hasConsent(patient.id, "whatsapp_communication") || !hasConsent(patient.id, "scale_photo_processing")) return save(options.store, { providerMessageId: input.providerMessageId, patient, mediaAssets: [], events: baseEvents(input, patient, options.now), outcome: "consent_withdrawn", safeResponse: "I’ve recorded that this demo cannot process non-essential WhatsApp or scale-photo information without consent. Please contact the demo care team." });
  if (input.media.length === 0) return save(options.store, { providerMessageId: input.providerMessageId, patient, mediaAssets: [], events: baseEvents(input, patient, options.now), outcome: "missing_media", safeResponse: "Thanks, Arthur. Please send a clear photo of the scale for this demo check-in." });

  const unsupported = input.media.find((media) => !isAcceptedImage(media));
  if (unsupported) return save(options.store, { providerMessageId: input.providerMessageId, patient, mediaAssets: [], events: baseEvents(input, patient, options.now), outcome: "unsupported_media", safeResponse: "Thanks, Arthur. I can only accept JPEG, PNG or WebP scale photos for this demo." });

  const mediaAssets = input.media.map((media, index) => toMediaAsset(media, patient, input, index, options.now));
  mediaAssets.forEach((asset) => scheduleMediaDeletion(asset));
  const events = [
    ...baseEvents(input, patient, options.now),
    ...mediaAssets.map((asset): AuraCareEvent => ({ id: `event-${input.providerMessageId}-scale-${asset.id}`, type: "scale_image.received", patientId: patient.id, occurredAt: options.now?.() ?? input.timestamp, payload: { mediaAssetId: asset.id, providerMediaId: asset.providerMediaId, mimeType: asset.mimeType, sizeBytes: asset.sizeBytes, retention: input.rawPayloadRetention } })),
    ({ id: `event-${input.providerMessageId}-weight-queue`, type: "weight.extraction_started", patientId: patient.id, occurredAt: options.now?.() ?? input.timestamp, payload: { status: "queued", reason: "Webhook acknowledged before heavy image processing." } } satisfies AuraCareEvent)
  ];
  return save(options.store, { providerMessageId: input.providerMessageId, patient, message: toMessage(input, patient, options.now), mediaAssets, events, outcome: "accepted", safeResponse: acceptedImageResponse });
}

function save(store: IntakeStore, record: IntakeRecord): IntakeRecord {
  store.save(record);
  return record;
}

function baseEvents(input: NormalisedInboundMessage, patient: Patient, now?: () => string): AuraCareEvent[] {
  return [{ id: `event-${input.providerMessageId}-message`, type: "message.received", patientId: patient.id, occurredAt: now?.() ?? input.timestamp, payload: { provider: input.provider, providerMessageId: input.providerMessageId, body: input.body, rawPayloadRetention: input.rawPayloadRetention } }];
}

function toMessage(input: NormalisedInboundMessage, patient: Patient, now?: () => string): Message {
  return { id: `message-${input.providerMessageId}`, conversationId: `conversation-${patient.id}`, direction: "inbound", body: input.body || "[media]", providerPayloadRef: input.rawPayloadRetention === "debug_retained" ? `raw-${input.providerMessageId}` : undefined, createdAt: now?.() ?? input.timestamp };
}

function toMediaAsset(media: NormalisedInboundMedia, patient: Patient, input: NormalisedInboundMessage, index: number, now?: () => string): MediaAsset {
  return { id: `media-${input.providerMessageId}-${index + 1}`, patientId: patient.id, providerMediaId: media.providerMediaId, storageReference: `mock-storage/${patient.id}/${input.providerMessageId}/${index + 1}`, mimeType: media.mimeType, sizeBytes: media.sizeBytes, sha256: media.sha256 ?? `pending-${input.providerMessageId}-${index + 1}`, status: "retained", createdAt: now?.() ?? input.timestamp };
}

function isAcceptedImage(media: NormalisedInboundMedia): boolean {
  return acceptedImageMimeTypes.includes(media.mimeType as (typeof acceptedImageMimeTypes)[number]) && media.sizeBytes <= maxWebhookUploadBytes;
}
