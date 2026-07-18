import { describe, expect, it } from "vitest";
import type { MediaAsset } from "@/lib/domain/types";
import { deleteMediaAfterConfirmation, getMediaRetentionRecord, resetMediaRetention, scheduleMediaDeletion } from "./media";

const media: MediaAsset = { id: "media-test-scale", patientId: "patient-arthur-pendleton", providerMediaId: "provider-media", storageReference: "private://scale-photo", mimeType: "image/jpeg", sizeBytes: 1024, sha256: "hash", status: "retained", createdAt: "2026-07-18T09:00:00.000Z" };

describe("media retention", () => {
  it("schedules and deletes image metadata without exposing storage URLs", () => {
    resetMediaRetention();
    const scheduled = scheduleMediaDeletion(media, new Date("2026-07-18T09:00:00.000Z"));
    expect(scheduled.status).toBe("scheduled_for_deletion");
    expect(scheduled.protectedPreviewPath).toBe("/api/media/media-test-scale/preview");
    const deleted = deleteMediaAfterConfirmation(media.id, "2026-07-18T10:00:00.000Z");
    expect(deleted?.status).toBe("deleted");
    expect(getMediaRetentionRecord(media.id)?.storageReference).toBe("private://scale-photo");
  });
});
