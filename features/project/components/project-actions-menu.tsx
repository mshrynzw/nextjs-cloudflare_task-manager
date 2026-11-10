"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/components/providers/locale-provider";
import {
  archiveProjectAction,
  updateProjectVisibilityAction,
} from "@/features/project/actions";
import {
  EditProjectDialog,
  type EditableProject,
} from "@/features/project/components/edit-project-dialog";
import { interpolate } from "@/lib/i18n/interpolate";
import { cn } from "@/lib/utils";

interface ProjectActionsMenuProps {
  project: EditableProject & { visibility: string };
  canEdit: boolean;
  canManage: boolean;
}

export function ProjectActionsMenu({
  project,
  canEdit,
  canManage,
}: ProjectActionsMenuProps) {
  const { t } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!canEdit && !canManage) {
    return null;
  }

  function onToggleVisibility() {
    const nextVisibility =
      project.visibility === "members" ? "workspace" : "members";
    startTransition(async () => {
      const result = await updateProjectVisibilityAction(
        project.id,
        nextVisibility,
      );
      if (result.status === "error") {
        setError(result.message ?? t.projects.visibilityFailed);
      }
    });
  }

  function onArchive() {
    const confirmed = window.confirm(
      interpolate(t.projects.archiveConfirm, { name: project.name }),
    );
    if (!confirmed) {
      return;
    }
    startTransition(async () => {
      const result = await archiveProjectAction(project.id);
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
          {canEdit ? (
            <DropdownMenuItem
              disabled={isPending}
              onClick={() => {
                setError(null);
                setEditOpen(true);
              }}
            >
              {t.projects.edit}
            </DropdownMenuItem>
          ) : null}
          {canEdit && canManage ? <DropdownMenuSeparator /> : null}
          {canManage ? (
            <>
              <DropdownMenuItem
                disabled={isPending}
                onClick={onToggleVisibility}
              >
                {project.visibility === "members"
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
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
      {error ? (
        <p className="mt-2 text-xs text-rose-400" role="alert">
          {error}
        </p>
      ) : null}
      {canEdit ? (
        <EditProjectDialog
          project={project}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      ) : null}
    </div>
  );
}
