"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogPopup,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/feedback/toast";
import { useI18n } from "@/components/providers/locale-provider";
import {
  updateProjectAction,
  type ProjectActionState,
} from "@/features/project/actions";
import { ProgressWeightsFields } from "@/features/project/components/progress-weights-fields";
import type { ProgressWeights } from "@/lib/project/progress";
import { cn } from "@/lib/utils";

const initialState: ProjectActionState = { status: "idle" };

export interface EditableProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  color: string;
  deadline: string | null;
  progressWeights: ProgressWeights;
}

function SaveButton() {
  const { pending } = useFormStatus();
  const { t } = useI18n();
  return (
    <Button type="submit" loading={pending}>
      {pending ? t.common.saving : t.common.save}
    </Button>
  );
}

function EditProjectForm({
  project,
  onSuccess,
}: {
  project: EditableProject;
  onSuccess: () => void;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction] = useActionState(
    async (prev: ProjectActionState, formData: FormData) => {
      const result = await updateProjectAction(project.id, prev, formData);
      if (result.status === "success") {
        toast(result.message ?? t.toasts.projectUpdated, "success");
        onSuccess();
        router.refresh();
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
          defaultValue={project.name}
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
          defaultValue={project.description ?? ""}
          className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none focus-visible:border-[color:var(--accent-ring)] focus-visible:ring-2 focus-visible:ring-[color:var(--accent-soft)]"
          placeholder={t.projects.descriptionPlaceholder}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm text-zinc-300">
          {t.projects.status}
          <Select
            name="status"
            defaultValue={project.status}
            className="mt-1.5"
          >
            <option value="planning">{t.status.planning}</option>
            <option value="active">{t.status.active}</option>
            <option value="on_hold">{t.status.on_hold}</option>
            <option value="completed">{t.status.completed}</option>
          </Select>
        </label>
        <label className="block text-sm text-zinc-300">
          {t.projects.priority}
          <Select
            name="priority"
            defaultValue={project.priority}
            className="mt-1.5"
          >
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
            defaultValue={project.color || "#4f7cff"}
            className="mt-1.5 h-10 w-full cursor-pointer rounded-lg border border-zinc-800 bg-zinc-950"
          />
        </label>
        <label className="block text-sm text-zinc-300">
          {t.projects.deadline}
          <Input
            type="date"
            name="deadline"
            defaultValue={project.deadline ?? ""}
            className="mt-1.5"
          />
        </label>
      </div>

      <ProgressWeightsFields initialWeights={project.progressWeights} />

      {state.status === "error" ? (
        <p className="text-sm text-rose-400" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 pt-1">
        <DialogClose className={cn(buttonVariants({ variant: "outline" }))}>
          {t.common.cancel}
        </DialogClose>
        <SaveButton />
      </div>
    </form>
  );
}

interface EditProjectDialogProps {
  project: EditableProject;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProjectDialog({
  project,
  open,
  onOpenChange,
}: EditProjectDialogProps) {
  const { t } = useI18n();
  const [formKey, setFormKey] = useState(0);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (nextOpen) {
          setFormKey((value) => value + 1);
        }
      }}
    >
      <DialogPopup className="max-h-[min(90vh,44rem)] max-w-lg overflow-y-auto">
        <DialogTitle>{t.projects.editTitle}</DialogTitle>
        <DialogDescription>{t.projects.editDescription}</DialogDescription>
        <EditProjectForm
          key={formKey}
          project={project}
          onSuccess={() => {
            onOpenChange(false);
          }}
        />
      </DialogPopup>
    </Dialog>
  );
}
