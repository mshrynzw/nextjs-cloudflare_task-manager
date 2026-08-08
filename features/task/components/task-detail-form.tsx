"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  archiveTaskAction,
  updateTaskAction,
  type TaskActionState,
} from "@/features/task/actions";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  type BoardMember,
} from "@/features/task/types";

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-500/30";

const initialState: TaskActionState = { status: "idle" };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

interface TaskDetailFormProps {
  projectId: string;
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    assigneeId: string | null;
    dueDate: string | null;
  };
  members: BoardMember[];
}

export function TaskDetailForm({
  projectId,
  task,
  members,
}: TaskDetailFormProps) {
  const router = useRouter();
  const boundUpdate = updateTaskAction.bind(null, projectId, task.id);
  const [state, formAction] = useActionState(boundUpdate, initialState);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [state.status, router]);

  async function onArchive() {
    const confirmed = window.confirm(`Archive “${task.title}”?`);
    if (!confirmed) {
      return;
    }
    const result = await archiveTaskAction(projectId, task.id);
    if (result.status === "error") {
      window.alert(result.message ?? "Failed to archive task.");
      return;
    }
    router.push(`/projects/${projectId}/board`);
    router.refresh();
  }

  return (
    <form action={formAction} className="space-y-4">
      <label className="block text-sm text-zinc-300">
        Title
        <input
          name="title"
          required
          maxLength={200}
          defaultValue={task.title}
          className={fieldClassName}
        />
      </label>
      <label className="block text-sm text-zinc-300">
        Description
        <textarea
          name="description"
          rows={6}
          maxLength={5000}
          defaultValue={task.description ?? ""}
          className={fieldClassName}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-zinc-300">
          Status
          <select
            name="status"
            defaultValue={task.status}
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
            defaultValue={task.priority}
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
        <label className="block text-sm text-zinc-300">
          Assignee
          <select
            name="assigneeId"
            defaultValue={task.assigneeId ?? ""}
            className={fieldClassName}
          >
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
          <input
            type="date"
            name="dueDate"
            defaultValue={task.dueDate?.slice(0, 10) ?? ""}
            className={fieldClassName}
          />
        </label>
      </div>

      {state.status === "error" ? (
        <p className="text-sm text-rose-400" role="alert">
          {state.message}
        </p>
      ) : null}
      {state.status === "success" ? (
        <p className="text-sm text-emerald-400" role="status">
          Saved.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <SaveButton />
        <Button type="button" variant="destructive" onClick={onArchive}>
          Archive task
        </Button>
      </div>
    </form>
  );
}
