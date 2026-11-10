import type { TaskStatus } from "@/lib/api/schemas";

export const DEFAULT_PROGRESS_WEIGHTS = {
  backlog: 0,
  todo: 0.2,
  in_progress: 0.5,
  review: 0.8,
  done: 1,
} as const satisfies Record<TaskStatus, number>;

export type ProgressWeights = {
  backlog: number;
  todo: number;
  in_progress: number;
  review: number;
  done: number;
};

export type TaskStatusCounts = ProgressWeights;

export const PROGRESS_WEIGHT_STATUSES = [
  "backlog",
  "todo",
  "in_progress",
  "review",
  "done",
] as const satisfies readonly TaskStatus[];

const STATUS_ORDER = PROGRESS_WEIGHT_STATUSES;

function isFiniteWeight(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function clampWeight(value: number): number {
  if (value < 0) {
    return 0;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

/** Returns true when weights are in range and non-decreasing along the board. */
export function areProgressWeightsValid(weights: ProgressWeights): boolean {
  let previous = 0;
  for (const status of STATUS_ORDER) {
    const value = weights[status];
    if (!isFiniteWeight(value) || value < 0 || value > 1) {
      return false;
    }
    if (value < previous) {
      return false;
    }
    previous = value;
  }
  return true;
}

export function parseProgressWeights(
  raw: string | null | undefined,
): ProgressWeights | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const record = parsed as Record<string, unknown>;
    const weights: ProgressWeights = {
      backlog: DEFAULT_PROGRESS_WEIGHTS.backlog,
      todo: DEFAULT_PROGRESS_WEIGHTS.todo,
      in_progress: DEFAULT_PROGRESS_WEIGHTS.in_progress,
      review: DEFAULT_PROGRESS_WEIGHTS.review,
      done: DEFAULT_PROGRESS_WEIGHTS.done,
    };

    for (const status of STATUS_ORDER) {
      const value = record[status];
      if (!isFiniteWeight(value)) {
        return null;
      }
      weights[status] = clampWeight(value);
    }

    if (!areProgressWeightsValid(weights)) {
      return null;
    }

    return weights;
  } catch {
    return null;
  }
}

export function resolveProgressWeights(
  raw: string | null | undefined,
): ProgressWeights {
  return parseProgressWeights(raw) ?? { ...DEFAULT_PROGRESS_WEIGHTS };
}

export function serializeProgressWeights(weights: ProgressWeights): string {
  return JSON.stringify(weights);
}

export function emptyTaskStatusCounts(): TaskStatusCounts {
  return {
    backlog: 0,
    todo: 0,
    in_progress: 0,
    review: 0,
    done: 0,
  };
}

/**
 * Weighted progress from task status counts.
 * Completed-only rate remains available via counts.done / total.
 */
export function calculateProjectProgress(
  counts: TaskStatusCounts,
  weights: ProgressWeights = DEFAULT_PROGRESS_WEIGHTS,
): number {
  const total =
    counts.backlog +
    counts.todo +
    counts.in_progress +
    counts.review +
    counts.done;

  if (total <= 0) {
    return 0;
  }

  const earned =
    counts.backlog * weights.backlog +
    counts.todo * weights.todo +
    counts.in_progress * weights.in_progress +
    counts.review * weights.review +
    counts.done * weights.done;

  return Math.round((earned / total) * 100);
}
