import { createProjectBodySchema } from "@/lib/api/request-schemas";
import {
  PROGRESS_WEIGHT_STATUSES,
  type ProgressWeights,
} from "@/lib/project/progress";

const projectEditFieldsSchema = createProjectBodySchema.pick({
  name: true,
  description: true,
  status: true,
  priority: true,
  color: true,
  deadline: true,
  progressWeights: true,
});

function parseProgressWeightPercent(
  value: FormDataEntryValue | null,
): number | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }
  const percent = Number(value);
  if (!Number.isFinite(percent)) {
    return null;
  }
  return percent / 100;
}

export function readProgressWeightsFromForm(
  formData: FormData,
): ProgressWeights | null {
  const weights = {
    backlog: 0,
    todo: 0,
    in_progress: 0,
    review: 0,
    done: 0,
  } satisfies ProgressWeights;

  for (const status of PROGRESS_WEIGHT_STATUSES) {
    const parsed = parseProgressWeightPercent(
      formData.get(`progressWeight_${status}`),
    );
    if (parsed == null) {
      return null;
    }
    weights[status] = parsed;
  }

  return weights;
}

export function parseProjectEditForm(formData: FormData) {
  const hasWeightFields = PROGRESS_WEIGHT_STATUSES.some((status) =>
    formData.has(`progressWeight_${status}`),
  );
  const progressWeights = readProgressWeightsFromForm(formData);

  // Edit form always posts weight fields; reject incomplete/invalid values
  // instead of silently skipping the update.
  const resolvedWeights =
    progressWeights ??
    (hasWeightFields
      ? {
          backlog: 1,
          todo: 0,
          in_progress: 0,
          review: 0,
          done: 0,
        }
      : undefined);

  return projectEditFieldsSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || null,
    status: formData.get("status") || undefined,
    priority: formData.get("priority") || undefined,
    color: formData.get("color") || undefined,
    deadline: formData.get("deadline") || null,
    progressWeights: resolvedWeights,
  });
}
