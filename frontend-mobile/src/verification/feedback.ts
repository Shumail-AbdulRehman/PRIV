import type { Manifest } from "./types";
/** Delivery and assessment are separate. Unknown states never imply a saved photo. */
export function photoFeedback(state: string): {
  label: string;
  detail: string;
  kind: "waiting" | "sending" | "review" | "action" | "done";
} {
  switch (state) {
    case "SAVED":
    case "RETRY_WAIT":
      return {
        label: "Photo saved on this phone",
        detail: "Saved locally does not mean received.",
        kind: "waiting",
      };
    case "UPLOADING":
      return {
        label: "Photo uploading",
        detail:
          "Keep the app open while the current photo uploads and is checked.",
        kind: "sending",
      };
    case "SERVER_ACCEPTED":
    case "PROCESSING":
      return {
        label: "Photo received and being checked",
        detail:
          "Keep the app open. The next item opens when this photo has been checked.",
        kind: "sending",
      };
    case "PASSED":
      return { label: "Photo approved", detail: "", kind: "done" };
    case "MANAGER_ACCEPTED":
      return { label: "Photo accepted by manager", detail: "", kind: "done" };
    case "WAIVED":
      return {
        label: "Requirement waived by manager",
        detail: "",
        kind: "done",
      };
    case "RECAPTURE_REQUIRED":
      return {
        label: "Take another photo",
        detail: "Follow the correction below and take another photo.",
        kind: "action",
      };
    case "CLEANING_REQUIRED":
      return {
        label: "Needs cleaning",
        detail: "Clean the affected surface, scan the room QR again, then take a new photo.",
        kind: "action",
      };
    case "REVIEW_REQUIRED":
    case "PRIVACY_HOLD":
      return {
        label: "Waiting for manager review",
        detail: "Saved photos are kept.",
        kind: "review",
      };
    case "SERVICE_FAILURE":
      return {
        label: "Photo check could not finish",
        detail: "Saved photos are kept.",
        kind: "review",
      };
    case "AUTH_REQUIRED":
      return {
        label: "Sign in to upload saved photos",
        detail: "Saved photos are kept.",
        kind: "waiting",
      };
    case "BLOCKED":
      return {
        label: "Saved photo needs help",
        detail: "Ask your manager",
        kind: "review",
      };
    default:
      return {
        label: "Photo needed",
        detail: "Not taken yet",
        kind: "waiting",
      };
  }
}
export function requiredPhotoIds(manifest: Manifest): Set<string> {
  return new Set(
    manifest.items
      .filter((item) => item.mandatory)
      .flatMap((item) =>
        item.requirements.filter((r) => r.mandatory).map((r) => r.id),
      ),
  );
}

export function photoCorrection(text: string, t: (text: string, values?: Record<string, string | number>) => string): string {
  const cleaning = /^Clean the (.+) and take another photo\.$/.exec(text);
  if (!cleaning) return t(text);
  const surfaces = cleaning[1].split(' and ').map(surface => t(surface)).join(t(' and '));
  return t('Clean {surfaces} and take another photo.', { surfaces });
}
