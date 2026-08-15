import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { ChecklistSection } from "@/features/task/components/checklist-section";
import { CommentsSection } from "@/features/task/components/comments-section";
import { TaskDetailForm } from "@/features/task/components/task-detail-form";
import { ApiError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/server";
import { getI18n } from "@/lib/i18n/get-i18n";
import { taskPriorityLabel, taskStatusLabel } from "@/lib/i18n/labels";
import { getProject } from "@/lib/services/project-service";
import { getTaskDetail } from "@/lib/services/task-service";

interface TaskDetailPageProps {
  params: Promise<{ projectId: string; taskId: string }>;
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const session = await auth();
  const { t } = await getI18n();
  const { projectId, taskId } = await params;
  const userId = session!.user!.id!;

  let project;
  let task;
  try {
    [project, task] = await Promise.all([
      getProject(getDb(), userId, projectId),
      getTaskDetail(getDb(), userId, taskId),
    ]);
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")
    ) {
      notFound();
    }
    throw error;
  }

  if (task.projectId !== projectId) {
    notFound();
  }

  const statusLabel = taskStatusLabel(t, task.status);
  const priorityLabel = taskPriorityLabel(t, task.priority);

  return (
    <>
      <AppHeader
        title={task.title}
        description={t.task.detail}
        userName={session?.user?.name}
        userEmail={session?.user?.email}
      />
      <main className="flex-1 space-y-6 px-4 py-6 sm:px-6">
        <nav aria-label={t.common.breadcrumb} className="text-xs text-zinc-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/dashboard" className="hover:text-zinc-300">
                {t.common.dashboard}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link
                href={`/projects/${project.id}`}
                className="hover:text-zinc-300"
              >
                {project.name}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link
                href={`/projects/${project.id}/board`}
                className="hover:text-zinc-300"
              >
                {t.board.crumb}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-zinc-300">{task.title}</li>
          </ol>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-violet-500/15 px-2 py-0.5 text-xs text-violet-300">
            {statusLabel}
          </span>
          <span className="rounded-md bg-zinc-500/15 px-2 py-0.5 text-xs text-zinc-300">
            {priorityLabel}
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
              <h2 className="mb-4 text-sm font-medium text-zinc-200">
                {t.task.information}
              </h2>
              <TaskDetailForm
                projectId={projectId}
                task={task}
                members={project.members.map((member) => ({
                  id: member.id,
                  name: member.name,
                  image: member.image,
                }))}
                canEdit={project.canEdit}
              />
            </section>
            <CommentsSection
              projectId={projectId}
              taskId={taskId}
              comments={task.comments}
              canEdit={project.canEdit}
            />
          </div>
          <div className="space-y-4">
            <ChecklistSection
              projectId={projectId}
              taskId={taskId}
              items={task.checklist}
              canEdit={project.canEdit}
            />
            <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
              <h2 className="mb-3 text-sm font-medium text-zinc-200">
                {t.task.activity}
              </h2>
              <p className="rounded-xl border border-dashed border-zinc-800 px-4 py-8 text-center text-sm text-zinc-500">
                {t.task.activityPlaceholder}
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
