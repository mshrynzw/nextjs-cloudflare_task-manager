"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/locale-provider";
import {
  addChecklistItemAction,
  removeChecklistItemAction,
  toggleChecklistItemAction,
  type TaskActionState,
} from "@/features/task/actions";

const initialState: TaskActionState = { status: "idle" };

function AddButton() {
  const { pending } = useFormStatus();
  const { t } = useI18n();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? t.common.adding : t.common.add}
    </Button>
  );
}

interface ChecklistSectionProps {
  projectId: string;
  taskId: string;
  items: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
  canEdit?: boolean;
}

export function ChecklistSection({
  projectId,
  taskId,
  items,
  canEdit = true,
}: ChecklistSectionProps) {
  const { t } = useI18n();
  const router = useRouter();
  const boundAdd = addChecklistItemAction.bind(null, projectId, taskId);
  const [state, formAction] = useActionState(boundAdd, initialState);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [state.status, router]);

  const completedCount = items.filter((item) => item.completed).length;

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-zinc-200">
          {t.task.checklist}
        </h2>
        <p className="text-xs tabular-nums text-zinc-500">
          {completedCount}/{items.length}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="mb-4 text-sm text-zinc-500">{t.task.noChecklist}</p>
      ) : (
        <ul className="mb-4 space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 rounded-lg border border-zinc-800/80 bg-zinc-950/50 px-3 py-2"
            >
              <input
                type="checkbox"
                checked={item.completed}
                disabled={isPending || !canEdit}
                aria-label={item.title}
                className="size-4 rounded border-zinc-700"
                onChange={(event) => {
                  startTransition(async () => {
                    await toggleChecklistItemAction({
                      projectId,
                      taskId,
                      checklistId: item.id,
                      completed: event.target.checked,
                    });
                    router.refresh();
                  });
                }}
              />
              <span
                className={`min-w-0 flex-1 text-sm ${item.completed ? "text-zinc-500 line-through" : "text-zinc-200"}`}
              >
                {item.title}
              </span>
              {canEdit ? (
                <button
                  type="button"
                  className="text-xs text-zinc-500 hover:text-rose-300"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      await removeChecklistItemAction({
                        projectId,
                        taskId,
                        checklistId: item.id,
                      });
                      router.refresh();
                    });
                  }}
                >
                  {t.common.remove}
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canEdit ? (
        <form action={formAction} className="flex gap-2">
          <label className="sr-only" htmlFor="checklist-new-item">
            {t.task.addChecklistItem}
          </label>
          <input
            id="checklist-new-item"
            name="title"
            required
            maxLength={200}
            placeholder={t.task.checklistPlaceholder}
            className="h-9 flex-1 rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 text-sm text-zinc-100 outline-none focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)]"
          />
          <AddButton />
        </form>
      ) : null}
      {state.status === "error" ? (
        <p className="mt-2 text-sm text-rose-400" role="alert">
          {state.message}
        </p>
      ) : null}
    </section>
  );
}
