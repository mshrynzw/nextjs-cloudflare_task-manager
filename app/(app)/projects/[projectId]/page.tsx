import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { buttonVariants } from "@/components/ui/button";
import { AvatarGroup } from "@/features/project/components/avatar-group";
import {
  ProjectPriorityBadge,
  ProjectStatusBadge,
} from "@/features/project/components/project-badges";
import { ProjectActionsMenu } from "@/features/project/components/project-actions-menu";
import { ProgressBar } from "@/features/project/components/progress-bar";
import {
  formatProjectDeadline,
  getInitials,
  isDeadlineOverdue,
} from "@/features/project/utils/labels";
import { ApiError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/server";
import { getProject } from "@/lib/services/project-service";
import { getTasksForProject } from "@/lib/services/task-service";
import { cn } from "@/lib/utils";

interface ProjectDetailPageProps {
  params: Promise<{ projectId: string }>;
}

const TASK_STATUS_LABELS: Record<string, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const session = await auth();
  const { projectId } = await params;
  const userId = session!.user!.id!;

  let project;
  try {
    project = await getProject(getDb(), userId, projectId);
  } catch (error) {
    if (error instanceof ApiError && error.code === "NOT_FOUND") {
      notFound();
    }
    if (error instanceof ApiError && error.code === "FORBIDDEN") {
      notFound();
    }
    throw error;
  }

  const tasks = await getTasksForProject(getDb(), userId, projectId, {
    sort: "updatedAt",
    order: "desc",
  });
  const recentTasks = tasks.slice(0, 8);
  const deadline = formatProjectDeadline(project.deadline);
  const overdue = isDeadlineOverdue(project.deadline);
  const openTasks =
    project.taskSummary.total - project.taskSummary.completed;

  return (
    <>
      <AppHeader
        title={project.name}
        description="Project overview and progress."
        userName={session?.user?.name}
        userEmail={session?.user?.email}
      />
      <main className="flex-1 space-y-6 px-4 py-6 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-xs text-zinc-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/dashboard" className="hover:text-zinc-300">
                Dashboard
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/projects" className="hover:text-zinc-300">
                Projects
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-zinc-300">{project.name}</li>
          </ol>
        </nav>

        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  aria-hidden
                  className="size-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <h2 className="text-xl font-semibold tracking-tight text-zinc-50">
                  {project.name}
                </h2>
                <ProjectStatusBadge status={project.status} />
                <ProjectPriorityBadge priority={project.priority} />
              </div>
              <p className="max-w-2xl text-sm text-zinc-400">
                {project.description?.trim() || "No description provided."}
              </p>
              <p className="mt-3 text-xs text-zinc-500">
                Deadline{" "}
                <span
                  className={cn(
                    "tabular-nums",
                    overdue ? "text-rose-400" : "text-zinc-300",
                  )}
                >
                  {deadline ?? "—"}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/projects/${project.id}#tasks`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                View tasks
              </Link>
              <ProjectActionsMenu
                projectId={project.id}
                projectName={project.name}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Progress">
            <ProgressBar value={project.progress} />
          </KpiCard>
          <KpiCard label="Total tasks">
            <p className="text-2xl font-semibold tabular-nums text-zinc-50">
              {project.taskSummary.total}
            </p>
          </KpiCard>
          <KpiCard label="Completed">
            <p className="text-2xl font-semibold tabular-nums text-emerald-300">
              {project.taskSummary.completed}
            </p>
          </KpiCard>
          <KpiCard label="Open">
            <p className="text-2xl font-semibold tabular-nums text-amber-300">
              {openTasks}
            </p>
          </KpiCard>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div
            id="tasks"
            className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-zinc-200">Recent tasks</h3>
              <span className="text-xs text-zinc-500">
                {tasks.length} total
              </span>
            </div>
            {recentTasks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
                No tasks yet. Task board arrives in Phase 6.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-800/80">
                {recentTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-zinc-100">
                        {task.title}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {TASK_STATUS_LABELS[task.status] ?? task.status}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] uppercase tracking-wide text-zinc-500">
                      {task.priority}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-200">Members</h3>
              <AvatarGroup members={project.members} max={5} />
            </div>
            {project.members.length === 0 ? (
              <p className="text-sm text-zinc-500">No members assigned.</p>
            ) : (
              <ul className="space-y-3">
                {project.members.map((member) => (
                  <li key={member.id} className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-zinc-200">
                      {getInitials(member.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-zinc-100">
                        {member.name ?? "Member"}
                      </p>
                      <p className="text-xs capitalize text-zinc-500">
                        {member.role}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
          <h3 className="text-sm font-medium text-zinc-200">Activity</h3>
          <p className="mt-3 rounded-xl border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
            Activity timeline will appear when task events are available.
          </p>
        </section>
      </main>
    </>
  );
}

function KpiCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4">
      <p className="mb-3 text-xs font-medium tracking-wide text-zinc-500 uppercase">
        {label}
      </p>
      {children}
    </div>
  );
}
