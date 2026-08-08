"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  createTaskAction,
  type TaskActionState,
} from "@/features/task/actions";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  type BoardMember,
  type TaskStatus,
} from "@/features/task/types";

const initialState: TaskActionState = { status: "idle" };

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-500/30";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating…" : "Create task"}
    </Button>
  );
}

interface CreateTaskDialogProps {
  projectId: string;
  members: BoardMember[];
  defaultStatus?: TaskStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function CreateTaskDialog({
  projectId,
  members,
  defaultStatus = "todo",
  open,
  onOpenChange,
  onCreated,
}: CreateTaskDialogProps) {
  const titleId = useId();
  const boundAction = createTaskAction.bind(null, projectId);
  const [state, formAction] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (state.status === "success") {
      onCreated?.();
      onOpenChange(false);
    }
  }, [state.status, onCreated, onOpenChange]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
      >
        <h2 id={titleId} className="text-lg font-semibold text-zinc-50">
          Create task
        </h2>
        <form action={formAction} className="mt-5 space-y-4">
          <label className="block text-sm text-zinc-300">
            Title
            <input
              name="title"
              required
              maxLength={200}
              className={fieldClassName}
              placeholder="Design landing page"
            />
          </label>
          <label className="block text-sm text-zinc-300">
            Description
            <textarea
              name="description"
              rows={3}
              maxLength={5000}
              className={fieldClassName}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm text-zinc-300">
              Status
              <select
                name="status"
                defaultValue={defaultStatus}
                className={fieldClassName}
              >
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {TASK_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-zinc-300">
              Priority
              <select
                name="priority"
                defaultValue="medium"
                className={fieldClassName}
              >
                {(
                  Object.keys(TASK_PRIORITY_LABELS) as Array<
                    keyof typeof TASK_PRIORITY_LABELS
                  >
                ).map((priority) => (
                  <option key={priority} value={priority}>
                    {TASK_PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm text-zinc-300">
              Assignee
              <select name="assigneeId" defaultValue="" className={fieldClassName}>
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name ?? member.id}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-zinc-300">
              Due date
              <input type="date" name="dueDate" className={fieldClassName} />
            </label>
          </div>
          {state.status === "error" ? (
            <p className="text-sm text-rose-400" role="alert">
              {state.message}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}

interface CreateTaskButtonProps {
  projectId: string;
  members: BoardMember[];
  onCreated?: () => void;
}

export function CreateTaskButton({
  projectId,
  members,
  onCreated,
}: CreateTaskButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        New Task
      </Button>
      <CreateTaskDialog
        projectId={projectId}
        members={members}
        open={open}
        onOpenChange={setOpen}
        onCreated={onCreated}
      />
    </>
  );
}
