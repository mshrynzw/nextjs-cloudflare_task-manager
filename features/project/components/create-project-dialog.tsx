"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogPopup,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useI18n } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import {
  createProjectAction,
  type ProjectActionState,
} from "@/features/project/actions";
import {
  WorkspaceMemberPicker,
  type WorkspaceMemberOption,
} from "@/features/project/components/workspace-member-picker";

const initialState: ProjectActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useI18n();
  return (
    <Button type="submit" loading={pending}>
      {pending ? t.common.creating : t.projects.create}
    </Button>
  );
}

function CreateProjectForm({
  onSuccess,
  workspaceMembers,
  currentUserId,
}: {
  onSuccess: () => void;
  workspaceMembers: WorkspaceMemberOption[];
  currentUserId: string;
}) {
  const { t } = useI18n();
  const [state, formAction] = useActionState(
    async (prev: ProjectActionState, formData: FormData) => {
      const result = await createProjectAction(prev, formData);
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
        {t.projects.name}
        <Input
          name="name"
          required
          maxLength={100}
          className="mt-1.5"
          placeholder={t.projects.namePlaceholder}
        />
      </label>

      <label className="block text-sm text-zinc-300">
        {t.projects.descriptionLabel}
        <textarea
          name="description"
          rows={3}
          maxLength={500}
          className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none focus-visible:border-[color:var(--accent-ring)] focus-visible:ring-2 focus-visible:ring-[color:var(--accent-soft)]"
          placeholder={t.projects.descriptionPlaceholder}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm text-zinc-300">
          {t.projects.status}
          <Select name="status" defaultValue="planning" className="mt-1.5">
            <option value="planning">{t.status.planning}</option>
            <option value="active">{t.status.active}</option>
            <option value="on_hold">{t.status.on_hold}</option>
            <option value="completed">{t.status.completed}</option>
          </Select>
        </label>
        <label className="block text-sm text-zinc-300">
          {t.projects.priority}
          <Select name="priority" defaultValue="medium" className="mt-1.5">
            <option value="low">{t.priority.low}</option>
            <option value="medium">{t.priority.medium}</option>
            <option value="high">{t.priority.high}</option>
          </Select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm text-zinc-300">
          {t.projects.color}
          <input
            type="color"
            name="color"
            defaultValue="#4f7cff"
            className="mt-1.5 h-10 w-full cursor-pointer rounded-lg border border-zinc-800 bg-zinc-950"
          />
        </label>
        <label className="block text-sm text-zinc-300">
          {t.projects.deadline}
          <Input type="date" name="deadline" className="mt-1.5" />
        </label>
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-3 text-sm text-zinc-300">
        <input
          type="checkbox"
          name="visibility"
          value="members"
          className="mt-0.5 size-4 shrink-0 rounded border-zinc-700"
        />
        <span>
          <span className="block font-medium text-zinc-200">
            {t.projects.visibilityLabel}
          </span>
          <span className="mt-1 block text-xs text-zinc-500">
            {t.projects.visibilityHelp}
          </span>
        </span>
      </label>

      <WorkspaceMemberPicker
        members={workspaceMembers}
        excludeIds={[currentUserId]}
      />

      {state.status === "error" ? (
        <p className="text-sm text-rose-400" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 pt-1">
        <DialogClose className={cn(buttonVariants({ variant: "outline" }))}>
          {t.common.cancel}
        </DialogClose>
        <SubmitButton />
      </div>
    </form>
  );
}

export function CreateProjectDialog({
  workspaceMembers,
  currentUserId,
}: {
  workspaceMembers: WorkspaceMemberOption[];
  currentUserId: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setFormKey((value) => value + 1);
        }
      }}
    >
      <DialogTrigger className={cn(buttonVariants())}>
        <Plus data-icon="inline-start" className="size-4" />
        {t.projects.newProject}
      </DialogTrigger>

      <DialogPopup>
        <DialogTitle>{t.projects.createTitle}</DialogTitle>
        <DialogDescription>{t.projects.createDescription}</DialogDescription>
        <CreateProjectForm
          key={formKey}
          workspaceMembers={workspaceMembers}
          currentUserId={currentUserId}
          onSuccess={() => {
            setOpen(false);
          }}
        />
      </DialogPopup>
    </Dialog>
  );
}
