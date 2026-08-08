import Link from "next/link";
import { AvatarGroup } from "@/features/project/components/avatar-group";
import {
  ProjectPriorityBadge,
  ProjectStatusBadge,
} from "@/features/project/components/project-badges";
import { ProgressBar } from "@/features/project/components/progress-bar";
import {
  formatProjectDeadline,
  isDeadlineOverdue,
} from "@/features/project/utils/labels";
import { cn } from "@/lib/utils";

export interface ProjectCardData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  color: string;
  progress: number;
  deadline: string | null;
  taskCount: number;
  completedTaskCount: number;
  members: Array<{
    id: string;
    name: string | null;
    image: string | null;
  }>;
}

interface ProjectCardProps {
  project: ProjectCardData;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const deadline = formatProjectDeadline(project.deadline);
  const overdue = isDeadlineOverdue(project.deadline);

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.7)] transition hover:border-zinc-700 hover:bg-zinc-900/80">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="mt-0.5 size-3 shrink-0 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h2 className="truncate text-base font-semibold text-zinc-50">
            <Link
              href={`/projects/${project.id}`}
              className="outline-none hover:underline focus-visible:underline"
            >
              {project.name}
            </Link>
          </h2>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          <ProjectStatusBadge status={project.status} />
          <ProjectPriorityBadge priority={project.priority} />
        </div>
      </div>

      <p className="mb-4 line-clamp-2 min-h-10 text-sm text-zinc-500">
        {project.description?.trim() || "No description"}
      </p>

      <ProgressBar value={project.progress} className="mb-4" />

      <div className="mt-auto flex items-end justify-between gap-3 pt-2">
        <div className="space-y-2">
          <AvatarGroup members={project.members} />
          <p className="text-xs text-zinc-500">
            <span className="tabular-nums text-zinc-300">
              {project.completedTaskCount}
            </span>
            {" / "}
            <span className="tabular-nums">{project.taskCount}</span> tasks
          </p>
        </div>
        <div className="text-right">
          {deadline ? (
            <p
              className={cn(
                "text-xs tabular-nums",
                overdue ? "text-rose-400" : "text-zinc-500",
              )}
            >
              Due {deadline}
            </p>
          ) : (
            <p className="text-xs text-zinc-600">No deadline</p>
          )}
          <Link
            href={`/projects/${project.id}`}
            className="mt-1 inline-flex text-xs font-medium text-violet-300 opacity-80 transition group-hover:opacity-100 hover:underline"
          >
            Open project
          </Link>
        </div>
      </div>
    </article>
  );
}
