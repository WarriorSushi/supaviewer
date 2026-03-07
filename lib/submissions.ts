export const submissionRejectionReasons = [
  { value: "invalid-source", label: "Invalid source" },
  { value: "duplicate-source", label: "Duplicate source" },
  { value: "rights-ambiguity", label: "Rights ambiguity" },
  { value: "insufficient-metadata", label: "Insufficient metadata" },
  { value: "not-long-form-fit", label: "Does not fit long-form focus" },
  { value: "other", label: "Other" },
] as const;

export type SubmissionRejectionReason = (typeof submissionRejectionReasons)[number]["value"];

const submissionRejectionReasonLabels = new Map(
  submissionRejectionReasons.map((reason) => [reason.value, reason.label]),
);

export function getSubmissionRejectionReasonLabel(reason: string | null | undefined) {
  if (!reason) {
    return null;
  }

  return submissionRejectionReasonLabels.get(reason as SubmissionRejectionReason) ?? "Editorial rejection";
}
