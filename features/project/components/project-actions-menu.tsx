"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { archiveProjectAction } from "@/features/project/actions";

interface ProjectActionsMenuProps {
  projectId: string;
  projectName: string;
}

export function ProjectActionsMenu({
  projectId,
  projectName,
}: ProjectActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onArchive() {
    const confirmed = window.confirm(
      `Archive “${projectName}”? You can find it later with the Archived filter.`,
    );
    if (!confirmed) {
      return;
    }
    startTransition(async () => {
      const result = await archiveProjectAction(projectId);
      if (result.status === "error") {
        setError(result.message ?? "Failed to archive project.");
        setOpen(false);
      }
    });
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Project actions"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <MoreHorizontal />
      </Button>
      {open ? (
        <div className="absolute top-full right-0 z-20 mt-2 w-44 rounded-xl border border-zinc-800 bg-zinc-950 py-1 shadow-xl">
          <button
            type="button"
            disabled={isPending}
            className="block w-full px-3 py-2 text-left text-sm text-rose-300 hover:bg-zinc-900 disabled:opacity-50"
            onClick={onArchive}
          >
            {isPending ? "Archiving…" : "Archive project"}
          </button>
        </div>
      ) : null}
      {error ? (
        <p className="absolute top-full right-0 mt-12 text-xs text-rose-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
