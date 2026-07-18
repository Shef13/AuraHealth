import type { MediaAsset } from "@/lib/domain/types";
import type { MediaRetentionRecord } from "./types";

export const mediaRetentionDays = Number(process.env.MEDIA_RETENTION_DAYS ?? 7);
const retentionRecords = new Map<string, MediaRetentionRecord>();

export function scheduleMediaDeletion(media: MediaAsset, now = new Date("2026-07-18T09:00:00.000Z")): MediaRetentionRecord {
  const deleteAfter = new Date(now.getTime() + mediaRetentionDays * 24 * 60 * 60 * 1000).toISOString();
  const record: MediaRetentionRecord = { mediaAssetId: media.id, patientId: media.patientId, storageReference: media.storageReference, status: "scheduled_for_deletion", deleteAfter, protectedPreviewPath: `/api/media/${media.id}/preview` };
  retentionRecords.set(media.id, record);
  return record;
}

export function deleteMediaAfterConfirmation(mediaAssetId: string, now = new Date().toISOString()): MediaRetentionRecord | undefined {
  const record = retentionRecords.get(mediaAssetId);
  if (!record) return undefined;
  const deleted = { ...record, status: "deleted" as const, deletedAt: now };
  retentionRecords.set(mediaAssetId, deleted);
  return deleted;
}

export function getMediaRetentionRecord(mediaAssetId: string): MediaRetentionRecord | undefined { return retentionRecords.get(mediaAssetId); }
export function resetMediaRetention(): void { retentionRecords.clear(); }
export function canAccessProtectedMedia(headers: Headers): boolean { return headers.get("x-auracare-demo-authorized") === "true"; }
