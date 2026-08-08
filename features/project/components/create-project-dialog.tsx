"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createProjectAction,
  type ProjectActionState,
} from "@/features/project/actions";

const initialState: ProjectActionState = { status: "idle" };

const fieldClassName =
  "mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none focus-visible:border-violet-500/50 focus-visible:ring-2 focus-visible:ring-violet-500/30";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating…" : "Create project"}
    </Button>
  );
}

export function CreateProjectDialog() {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createProjectAction, initialState);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <Plus data-icon="inline-start" />
        New Project
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
          >
            <h2 id={titleId} className="text-lg font-semibold text-zinc-50">
              Create project
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Add a project to your workspace.
            </p>

            <form action={formAction} className="mt-5 space-y-4">
              <label className="block text-sm text-zinc-300">
                Name
                <input
                  name="name"
                  required
                  maxLength={100}
                  className={fieldClassName}
                  placeholder="Website renewal"
                />
              </label>

              <label className="block text-sm text-zinc-300">
                Description
                <textarea
                  name="description"
                  rows={3}
                  maxLength={500}
                  className={fieldClassName}
                  placeholder="Optional summary"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm text-zinc-300">
                  Status
                  <select
                    name="status"
                    defaultValue="planning"
                    className={fieldClassName}
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </label>
                <label className="block text-sm text-zinc-300">
                  Priority
                  <select
                    name="priority"
                    defaultValue="medium"
                    className={fieldClassName}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
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
                  <input
                    type="date"
                    name="deadline"
                    className={fieldClassName}
                  />
                </label>
              </div>

              {state.status === "error" ? (
                <p className="text-sm text-rose-400" role="alert">
                  {state.message}
                </p>
              ) : null}

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <SubmitButton />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
