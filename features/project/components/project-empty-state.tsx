import { FolderKanban } from "lucide-react";
import { CreateProjectDialog } from "@/features/project/components/create-project-dialog";

export function ProjectEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
        <FolderKanban className="size-6" aria-hidden />
      </div>
      <h2 className="text-lg font-medium text-zinc-100">No projects yet</h2>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        Create your first project to start organizing tasks and tracking
        progress.
      </p>
      <div className="mt-6">
        <CreateProjectDialog />
      </div>
    </div>
  );
}
