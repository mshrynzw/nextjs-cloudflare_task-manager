"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  addChecklistItemAction,
  removeChecklistItemAction,
  toggleChecklistItemAction,
  type TaskActionState,
} from "@/features/task/actions";

const initialState: TaskActionState = { status: "idle" };

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      {pending ? "Adding…" : "Add"}
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
}

export function ChecklistSection({
  projectId,
  taskId,
  items,
}: ChecklistSectionProps) {
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
        <h2 className="text-sm font-medium text-zinc-200">Checklist</h2>
        <p className="text-xs tabular-nums text-zinc-500">
          {completedCount}/{items.length}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="mb-4 text-sm text-zinc-500">No checklist items yet.</p>
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
                disabled={isPending}
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
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="flex gap-2">
        <label className="sr-only" htmlFor="checklist-new-item">
          Add checklist item
        </label>
        <input
          id="checklist-new-item"
          name="title"
          required
          maxLength={200}
          placeholder="Add an item…"
          className="h-9 flex-1 rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 text-sm text-zinc-100 outline-none focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)]"
        />
        <AddButton />
      </form>
      {state.status === "error" ? (
        <p className="mt-2 text-sm text-rose-400" role="alert">
          {state.message}
        </p>
      ) : null}
    </section>
  );
}
