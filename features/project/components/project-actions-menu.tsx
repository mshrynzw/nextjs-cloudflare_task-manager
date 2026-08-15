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
import { useI18n } from "@/components/providers/locale-provider";
import {
  archiveProjectAction,
  updateProjectVisibilityAction,
} from "@/features/project/actions";
import { interpolate } from "@/lib/i18n/interpolate";
import { cn } from "@/lib/utils";

interface ProjectActionsMenuProps {
  projectId: string;
  projectName: string;
  visibility: string;
}

export function ProjectActionsMenu({
  projectId,
  projectName,
  visibility,
}: ProjectActionsMenuProps) {
  const { t } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onToggleVisibility() {
    const nextVisibility = visibility === "members" ? "workspace" : "members";
    startTransition(async () => {
      const result = await updateProjectVisibilityAction(
        projectId,
        nextVisibility,
      );
      if (result.status === "error") {
        setError(result.message ?? t.projects.visibilityFailed);
      }
    });
  }

  function onArchive() {
    const confirmed = window.confirm(
      interpolate(t.projects.archiveConfirm, { name: projectName }),
    );
    if (!confirmed) {
      return;
    }
    startTransition(async () => {
      const result = await archiveProjectAction(projectId);
      if (result.status === "error") {
        setError(result.message ?? t.projects.archiveFailed);
      }
    });
  }

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "outline", size: "icon-sm" }),
          )}
          aria-label={t.projects.actions}
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled={isPending} onClick={onToggleVisibility}>
            {visibility === "members"
              ? t.projects.makePublic
              : t.projects.makePrivate}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isPending}
            onClick={onArchive}
            className="text-rose-300 data-highlighted:text-rose-200"
          >
            {isPending ? t.projects.archiving : t.projects.archive}
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
