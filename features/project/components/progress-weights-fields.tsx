"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/components/providers/locale-provider";
import { taskStatusLabel } from "@/lib/i18n/labels";
import {
  DEFAULT_PROGRESS_WEIGHTS,
  PROGRESS_WEIGHT_STATUSES,
  type ProgressWeights,
} from "@/lib/project/progress";

function toPercent(value: number): number {
  return Math.round(value * 100);
}

function fromDefaults(): Record<(typeof PROGRESS_WEIGHT_STATUSES)[number], number> {
  return {
    backlog: toPercent(DEFAULT_PROGRESS_WEIGHTS.backlog),
    todo: toPercent(DEFAULT_PROGRESS_WEIGHTS.todo),
    in_progress: toPercent(DEFAULT_PROGRESS_WEIGHTS.in_progress),
    review: toPercent(DEFAULT_PROGRESS_WEIGHTS.review),
    done: toPercent(DEFAULT_PROGRESS_WEIGHTS.done),
  };
}

function fromWeights(
  weights: ProgressWeights,
): Record<(typeof PROGRESS_WEIGHT_STATUSES)[number], number> {
  return {
    backlog: toPercent(weights.backlog),
    todo: toPercent(weights.todo),
    in_progress: toPercent(weights.in_progress),
    review: toPercent(weights.review),
    done: toPercent(weights.done),
  };
}

interface ProgressWeightsFieldsProps {
  initialWeights: ProgressWeights;
}

export function ProgressWeightsFields({
  initialWeights,
}: ProgressWeightsFieldsProps) {
  const { t } = useI18n();
  const [values, setValues] = useState(() => fromWeights(initialWeights));

  return (
    <fieldset className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
      <legend className="px-1 text-sm font-medium text-zinc-200">
        {t.projects.progressWeights}
      </legend>
      <p className="text-xs text-zinc-500">{t.projects.progressWeightsHelp}</p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {PROGRESS_WEIGHT_STATUSES.map((status) => (
          <label key={status} className="block text-sm text-zinc-300">
            {taskStatusLabel(t, status)}
            <div className="mt-1.5 flex items-center gap-2">
              <Input
                type="number"
                name={`progressWeight_${status}`}
                min={0}
                max={100}
                step={1}
                required
                value={values[status]}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setValues((current) => ({
                    ...current,
                    [status]: Number.isFinite(next) ? next : current[status],
                  }));
                }}
                className="tabular-nums"
                aria-describedby="progress-weights-hint"
              />
              <span className="shrink-0 text-xs text-zinc-500" aria-hidden>
                %
              </span>
            </div>
          </label>
        ))}
      </div>

      <p id="progress-weights-hint" className="text-xs text-zinc-500">
        {t.projects.progressWeightsRule}
      </p>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setValues(fromDefaults());
        }}
      >
        {t.projects.progressWeightsReset}
      </Button>
    </fieldset>
  );
}
