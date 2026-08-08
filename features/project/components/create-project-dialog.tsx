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
import { cn } from "@/lib/utils";
import {
  createProjectAction,
  type ProjectActionState,
} from "@/features/project/actions";

const initialState: ProjectActionState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating…" : "Create project"}
    </Button>
  );
}

function CreateProjectForm({ onSuccess }: { onSuccess: () => void }) {
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
        Name
        <Input
          name="name"
          required
          maxLength={100}
          className="mt-1.5"
          placeholder="Website renewal"
        />
      </label>

      <label className="block text-sm text-zinc-300">
        Description
        <textarea
          name="description"
          rows={3}
          maxLength={500}
          className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none focus-visible:border-[color:var(--accent-ring)] focus-visible:ring-2 focus-visible:ring-[color:var(--accent-soft)]"
          placeholder="Optional summary"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm text-zinc-300">
          Status
          <Select name="status" defaultValue="planning" className="mt-1.5">
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </Select>
        </label>
        <label className="block text-sm text-zinc-300">
          Priority
          <Select name="priority" defaultValue="medium" className="mt-1.5">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm text-zinc-300">
          Color
          <input
            type="color"
            name="color"
            defaultValue="#4f7cff"
            className="mt-1.5 h-10 w-full cursor-pointer rounded-lg border border-zinc-800 bg-zinc-950"
          />
        </label>
        <label className="block text-sm text-zinc-300">
          Deadline
          <Input type="date" name="deadline" className="mt-1.5" />
        </label>
      </div>

      {state.status === "error" ? (
        <p className="text-sm text-rose-400" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 pt-1">
        <DialogClose className={cn(buttonVariants({ variant: "outline" }))}>
          Cancel
        </DialogClose>
        <SubmitButton />
      </div>
    </form>
  );
}

export function CreateProjectDialog() {
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
        New Project
      </DialogTrigger>

      <DialogPopup>
        <DialogTitle>Create project</DialogTitle>
        <DialogDescription>
          Add a project to your workspace.
        </DialogDescription>
        <CreateProjectForm
          key={formKey}
          onSuccess={() => {
            setOpen(false);
          }}
        />
      </DialogPopup>
    </Dialog>
  );
}
