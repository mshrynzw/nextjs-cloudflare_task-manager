"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/providers/locale-provider";
import { interpolate } from "@/lib/i18n/interpolate";
import {
  archiveTaskAction,
  updateTaskAction,
  type TaskActionState,
} from "@/features/task/actions";
import {
  TASK_STATUSES,
  type BoardMember,
  type TaskPriority,
} from "@/features/task/types";

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-500/30";

const initialState: TaskActionState = { status: "idle" };

const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];

function SaveButton() {
  const { pending } = useFormStatus();
  const { t } = useI18n();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? t.common.saving : t.task.saveChanges}
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
  canEdit?: boolean;
}

export function TaskDetailForm({
  projectId,
  task,
  members,
  canEdit = true,
}: TaskDetailFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const boundUpdate = updateTaskAction.bind(null, projectId, task.id);
  const [state, formAction] = useActionState(boundUpdate, initialState);

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [state.status, router]);

  async function onArchive() {
    const confirmed = window.confirm(
      interpolate(t.task.archiveConfirm, { title: task.title }),
    );
    if (!confirmed) {
      return;
    }
    const result = await archiveTaskAction(projectId, task.id);
    if (result.status === "error") {
      window.alert(result.message ?? t.task.archiveFailed);
      return;
    }
    router.push(`/projects/${projectId}/board`);
    router.refresh();
  }

  return (
    <form action={formAction} className="space-y-4">
      <label className="block text-sm text-zinc-300">
        {t.task.title}
        <input
          name="title"
          required
          maxLength={200}
          defaultValue={task.title}
          disabled={!canEdit}
          className={fieldClassName}
        />
      </label>
      <label className="block text-sm text-zinc-300">
        {t.task.description}
        <textarea
          name="description"
          rows={6}
          maxLength={5000}
          defaultValue={task.description ?? ""}
          disabled={!canEdit}
          className={fieldClassName}
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-zinc-300">
          {t.task.status}
          <select
            name="status"
            defaultValue={task.status}
            disabled={!canEdit}
            className={fieldClassName}
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t.taskStatus[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-zinc-300">
          {t.task.priority}
          <select
            name="priority"
            defaultValue={task.priority}
            disabled={!canEdit}
            className={fieldClassName}
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {t.priority[priority]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-zinc-300">
          {t.task.assignee}
          <select
            name="assigneeId"
            defaultValue={task.assigneeId ?? ""}
            disabled={!canEdit}
            className={fieldClassName}
          >
            <option value="">{t.task.unassigned}</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name ?? member.id}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-zinc-300">
          {t.task.dueDate}
          <input
            type="date"
            name="dueDate"
            defaultValue={task.dueDate?.slice(0, 10) ?? ""}
            disabled={!canEdit}
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
          {t.task.saved}
        </p>
      ) : null}

      {canEdit ? (
        <div className="flex flex-wrap gap-2">
          <SaveButton />
          <Button type="button" variant="destructive" onClick={onArchive}>
            {t.task.archive}
          </Button>
        </div>
      ) : (
        <p className="text-xs text-zinc-500">{t.project.viewOnlyNotice}</p>
      )}
    </form>
  );
}
