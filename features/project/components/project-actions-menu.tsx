"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { archiveProjectAction } from "@/features/project/actions";
import { cn } from "@/lib/utils";

interface ProjectActionsMenuProps {
  projectId: string;
  projectName: string;
}

export function ProjectActionsMenu({
  projectId,
  projectName,
}: ProjectActionsMenuProps) {
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
      }
    });
  }

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }))}
          aria-label="Project actions"
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={isPending}
            onClick={onArchive}
            className="text-rose-300 data-highlighted:text-rose-200"
          >
            {isPending ? "Archiving…" : "Archive project"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {error ? (
        <p className="mt-2 text-xs text-rose-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
