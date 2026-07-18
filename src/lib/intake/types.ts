import type { AuraCareEvent, MediaAsset, Message, Patient } from "@/lib/domain/types";

export type MessagingProviderName = "mock" | "twilio";
export type IntakeOutcomeCode = "accepted" | "duplicate" | "unsupported_media" | "missing_media" | "unknown_sender" | "invalid_signature" | "consent_withdrawn";
export type PayloadRetention = "discarded" | "debug_retained";

export interface NormalisedInboundMedia {
  providerMediaId: string;
  mimeType: string;
  sizeBytes: number;
  sha256?: string;
}

export interface NormalisedInboundMessage {
  provider: MessagingProviderName;
  providerMessageId: string;
  from: string;
  to?: string;
  body: string;
  timestamp: string;
  media: NormalisedInboundMedia[];
  rawPayloadRetention: PayloadRetention;
}

export interface IntakeRecord {
  providerMessageId: string;
  patient?: Patient;
  message?: Message;
  mediaAssets: MediaAsset[];
  events: AuraCareEvent[];
  outcome: IntakeOutcomeCode;
  safeResponse: string;
}

export interface IntakeStore {
  hasProviderMessage(providerMessageId: string): boolean;
  save(record: IntakeRecord): void;
  reset(): void;
  all(): IntakeRecord[];
}
