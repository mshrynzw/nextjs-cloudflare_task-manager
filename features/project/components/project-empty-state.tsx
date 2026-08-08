import { FolderKanban } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { CreateProjectDialog } from "@/features/project/components/create-project-dialog";

export function ProjectEmptyState() {
  return (
    <EmptyState
      title="No projects yet"
      description="Create your first project to start organizing tasks and tracking progress."
      icon={<FolderKanban className="size-6" aria-hidden />}
      action={<CreateProjectDialog />}
    />
  );
}
