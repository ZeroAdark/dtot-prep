export interface ResponsePatch {
  selectedOptionId?: string | null;
  flagged?: boolean;
  timeSpentSec?: number;
}

interface ExistingResponseState {
  flagged: boolean;
  timeSpentSec: number;
}

export interface ResponseUpdate {
  selectedOptionId?: string | null;
  isCorrect?: boolean | null;
  flagged?: boolean;
  timeSpentSec?: number;
  answeredAt?: Date | null;
}

function hasOwn(value: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

/**
 * Parse the partial response-update contract without turning omitted fields
 * into explicit nulls. In particular, a flag-only request must not clear the
 * candidate's selected answer.
 */
export function parseResponsePatch(
  body: Record<string, unknown>,
): ResponsePatch {
  const patch: ResponsePatch = {};

  if (hasOwn(body, "selectedOptionId")) {
    if (
      body.selectedOptionId !== null &&
      typeof body.selectedOptionId !== "string"
    ) {
      throw new Error("selectedOptionId must be a string or null.");
    }
    patch.selectedOptionId = body.selectedOptionId;
  }

  if (hasOwn(body, "flagged")) {
    if (typeof body.flagged !== "boolean") {
      throw new Error("flagged must be a boolean.");
    }
    patch.flagged = body.flagged;
  }

  if (hasOwn(body, "timeSpentSec")) {
    if (
      typeof body.timeSpentSec !== "number" ||
      !Number.isInteger(body.timeSpentSec) ||
      body.timeSpentSec < 0
    ) {
      throw new Error("timeSpentSec must be a non-negative integer.");
    }
    patch.timeSpentSec = body.timeSpentSec;
  }

  return patch;
}

/** Build only the database fields explicitly requested by the client. */
export function buildResponseUpdate(
  existing: ExistingResponseState,
  correctId: string | null,
  patch: ResponsePatch,
): ResponseUpdate {
  const update: ResponseUpdate = {};

  if (patch.selectedOptionId !== undefined) {
    update.selectedOptionId = patch.selectedOptionId;
    update.isCorrect =
      patch.selectedOptionId !== null && correctId !== null
        ? patch.selectedOptionId === correctId
        : null;
    update.answeredAt = patch.selectedOptionId !== null ? new Date() : null;
  }

  if (patch.flagged !== undefined) update.flagged = patch.flagged;
  if (patch.timeSpentSec !== undefined) {
    update.timeSpentSec = existing.timeSpentSec + patch.timeSpentSec;
  }

  return update;
}
