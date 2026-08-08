import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { BoardToolbar } from "@/features/task/components/board-toolbar";
import { TaskBoard } from "@/features/task/components/task-board";
import { ApiError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/server";
import { getProject } from "@/lib/services/project-service";
import { getTasksForProject } from "@/lib/services/task-service";
import type { BoardTask } from "@/features/task/types";

interface BoardPageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function ProjectBoardPage({
  params,
  searchParams,
}: BoardPageProps) {
  const session = await auth();
  const { projectId } = await params;
  const raw = await searchParams;
  const search = firstValue(raw.search) ?? "";
  const priority = firstValue(raw.priority) ?? "";
  const userId = session!.user!.id!;

  let project;
  try {
    project = await getProject(getDb(), userId, projectId);
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")
    ) {
      notFound();
    }
    throw error;
  }

  const tasks = await getTasksForProject(getDb(), userId, projectId, {
    sort: "position",
    order: "asc",
    search: search || undefined,
    priority: priority || undefined,
  });

  const boardTasks: BoardTask[] = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    projectId: task.projectId,
    assigneeId: task.assigneeId,
    dueDate: task.dueDate,
    position: task.position,
    updatedAt: task.updatedAt,
  }));

  return (
    <>
      <AppHeader
        title="Task Board"
        description={project.name}
        userName={session?.user?.name}
        userEmail={session?.user?.email}
      />
      <main className="flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
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
            <li>
              <Link
                href={`/projects/${project.id}`}
                className="hover:text-zinc-300"
              >
                {project.name}
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-zinc-300">Board</li>
          </ol>
        </nav>

        <Suspense fallback={<div className="mb-4 h-10" />}>
          <BoardToolbar />
        </Suspense>

        <TaskBoard
          key={boardTasks
            .map(
              (task) =>
                `${task.id}:${task.status}:${task.position}:${task.updatedAt}`,
            )
            .join("|")}
          projectId={project.id}
          initialTasks={boardTasks}
          members={project.members.map((member) => ({
            id: member.id,
            name: member.name,
            image: member.image,
          }))}
          search={search}
          priority={priority}
        />
      </main>
    </>
  );
}
