import { FolderKanban } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { CreateProjectDialog } from "@/features/project/components/create-project-dialog";
import type { WorkspaceMemberOption } from "@/features/project/components/workspace-member-picker";
import { getI18n } from "@/lib/i18n/get-i18n";

export async function ProjectEmptyState({
  workspaceMembers,
  currentUserId,
}: {
  workspaceMembers: WorkspaceMemberOption[];
  currentUserId: string;
}) {
  const { t } = await getI18n();

  return (
    <EmptyState
      title={t.projects.emptyTitle}
      description={t.projects.emptyDescription}
      icon={<FolderKanban className="size-6" aria-hidden />}
      action={
        <CreateProjectDialog
          workspaceMembers={workspaceMembers}
          currentUserId={currentUserId}
        />
      }
    />
  );
}
