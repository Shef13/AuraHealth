import type { CallSession, ProviderMode, RiskAssessment } from "@/lib/domain/types";
import type { StructuredWeightExtractionResult } from "@/lib/extraction/types";

export type SendTextInput = { to: string; body: string };
export type SendInteractiveMessageInput = { to: string; body: string; actions: Array<{ id: string; label: string }> };
export type SendResult = { providerMessageId: string; acceptedAt: string; mode: ProviderMode };
export type DownloadMediaInput = { providerMediaId: string };
export type MediaFile = { bytes: Uint8Array; mimeType: string; sha256: string };
export type WeightImageInput = { media: MediaFile; mediaAssetId?: string };
export type WeightExtractionResult = StructuredWeightExtractionResult;
export type CallPermissionInput = { patientId: string; phoneNumber: string };
export type CallPermissionResult = { status: "requested" | "granted" | "declined"; providerReference: string };
export type StartCallInput = { patientId: string; phoneNumber: string; questions: string[] };
export type AssessmentInput = { patientId: string; responses: string[]; recentWeightsKg: number[] };

export interface MessagingProvider { sendText(input: SendTextInput): Promise<SendResult>; sendInteractiveMessage(input: SendInteractiveMessageInput): Promise<SendResult>; downloadMedia(input: DownloadMediaInput): Promise<MediaFile>; }
export interface VisionProvider { extractWeight(input: WeightImageInput): Promise<WeightExtractionResult>; }
export interface VoiceProvider { requestCallPermission(input: CallPermissionInput): Promise<CallPermissionResult>; startCall(input: StartCallInput): Promise<CallSession>; }
export interface ClinicalAnalysisProvider { analyseAssessment(input: AssessmentInput): Promise<RiskAssessment>; }
