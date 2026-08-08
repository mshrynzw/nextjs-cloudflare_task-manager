"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
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
  "mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none focus-visible:border-[color:var(--accent-ring)] focus-visible:ring-2 focus-visible:ring-[color:var(--accent-soft)]";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
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

function CreateTaskForm({
  projectId,
  members,
  defaultStatus,
  onSuccess,
}: {
  projectId: string;
  members: BoardMember[];
  defaultStatus: TaskStatus;
  onSuccess: () => void;
}) {
  const boundAction = createTaskAction.bind(null, projectId);
  const [state, formAction] = useActionState(
    async (prev: TaskActionState, formData: FormData) => {
      const result = await boundAction(prev, formData);
      if (result.status === "success") {
        onSuccess();
      }
      return result;
    },
    initialState,
  );

  return (
    <form action={formAction} className="mt-5 space-y-4">
      <label className="block text-sm text-zinc-300">
        Title
        <Input
          name="title"
          required
          maxLength={200}
          className="mt-1.5"
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
          <Select
            name="status"
            defaultValue={defaultStatus}
            className="mt-1.5"
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {TASK_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </label>
        <label className="block text-sm text-zinc-300">
          Priority
          <Select name="priority" defaultValue="medium" className="mt-1.5">
            {(
              Object.keys(TASK_PRIORITY_LABELS) as Array<
                keyof typeof TASK_PRIORITY_LABELS
              >
            ).map((priority) => (
              <option key={priority} value={priority}>
                {TASK_PRIORITY_LABELS[priority]}
              </option>
            ))}
          </Select>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm text-zinc-300">
          Assignee
          <Select name="assigneeId" defaultValue="" className="mt-1.5">
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name ?? member.id}
              </option>
            ))}
          </Select>
        </label>
        <label className="block text-sm text-zinc-300">
          Due date
          <Input type="date" name="dueDate" className="mt-1.5" />
        </label>
      </div>
      {state.status === "error" ? (
        <p className="text-sm text-rose-400" role="alert">
          {state.message}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        <DialogClose className={cn(buttonVariants({ variant: "outline" }))}>
          Cancel
        </DialogClose>
        <SubmitButton />
      </div>
    </form>
  );
}

export function CreateTaskDialog({
  projectId,
  members,
  defaultStatus = "todo",
  open,
  onOpenChange,
  onCreated,
}: CreateTaskDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
      }}
    >
      {open ? (
        <DialogPopup>
          <DialogTitle>Create task</DialogTitle>
          <DialogDescription>
            Add a task to this project. You can change status and assignee later.
          </DialogDescription>
          <CreateTaskForm
            key={`${projectId}-${defaultStatus}-${String(open)}`}
            projectId={projectId}
            members={members}
            defaultStatus={defaultStatus}
            onSuccess={() => {
              onCreated?.();
              onOpenChange(false);
            }}
          />
        </DialogPopup>
      ) : null}
    </Dialog>
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
