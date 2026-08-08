import Link from "next/link";
import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { StatCard } from "@/components/feedback/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { ProgressBar } from "@/features/project/components/progress-bar";
import { getDb } from "@/lib/db/server";
import { getDashboardOverview } from "@/lib/services/dashboard-service";
import { cn } from "@/lib/utils";

const ACTION_LABELS: Record<string, string> = {
  task_created: "created a task",
  task_status_changed: "updated task status",
  task_assignee_changed: "changed assignee",
  comment_added: "added a comment",
};

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;
  const data = await getDashboardOverview(getDb(), userId);
  const firstName =
    session?.user?.name?.split(" ")[0] ?? session?.user?.email ?? "there";

  return (
    <>
      <AppHeader
        title="Overview"
        description={`Welcome back, ${firstName}.`}
        userName={session?.user?.name}
        userEmail={session?.user?.email}
      />
      <main className="flex-1 space-y-6 px-4 py-6 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Today's tasks" value={data.kpis.todayTasks} />
          <StatCard
            label="Completed today"
            value={data.kpis.completedToday}
          />
          <StatCard
            label="Completion rate"
            value={`${data.kpis.completionRate}%`}
          />
          <StatCard
            label="Overdue"
            value={data.kpis.overdueTasks}
            hint={`${data.kpis.openTasks} open tasks`}
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Panel title="Today's tasks">
            <TaskList
              tasks={data.todayTasks}
              empty="No tasks due today."
            />
          </Panel>
          <Panel title="Overdue">
            <TaskList
              tasks={data.overdueTasks}
              empty="Nothing overdue. Nice work."
              danger
            />
          </Panel>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Panel title="Project progress">
            {data.projects.length === 0 ? (
              <Empty text="No projects yet." href="/projects" label="Create one" />
            ) : (
              <ul className="space-y-4">
                {data.projects.map((project) => (
                  <li key={project.id}>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-sm font-medium text-zinc-100 hover:underline"
                      >
                        {project.name}
                      </Link>
                      <span className="text-xs tabular-nums text-zinc-500">
                        {project.completedTaskCount}/{project.taskCount}
                      </span>
                    </div>
                    <ProgressBar value={project.progress} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Upcoming">
            <TaskList
              tasks={data.upcomingTasks}
              empty="No upcoming deadlines."
            />
          </Panel>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Panel title="Recent activity">
            {data.activities.length === 0 ? (
              <p className="text-sm text-zinc-500">No recent activity.</p>
            ) : (
              <ul className="space-y-3">
                {data.activities.map((item) => (
                  <li key={item.id} className="text-sm text-zinc-400">
                    <span className="text-zinc-200">
                      {item.userName ?? "Someone"}
                    </span>{" "}
                    {ACTION_LABELS[item.action] ?? item.action}
                    {item.projectName ? (
                      <>
                        {" "}
                        in{" "}
                        <Link
                          href={`/projects/${item.projectId}`}
                          className="text-violet-300 hover:underline"
                        >
                          {item.projectName}
                        </Link>
                      </>
                    ) : null}
                    <span className="mt-0.5 block text-[11px] tabular-nums text-zinc-600">
                      {new Date(item.createdAt * 1000).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Quick actions">
            <div className="flex flex-col gap-2">
              <Link
                href="/projects"
                className={cn(buttonVariants({ size: "lg" }), "justify-start")}
              >
                Browse projects
              </Link>
              <Link
                href="/calendar"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "justify-start",
                )}
              >
                Open calendar
              </Link>
              <Link
                href="/analytics"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "justify-start",
                )}
              >
                View analytics
              </Link>
              <Link
                href="/notifications"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "justify-start",
                )}
              >
                Notifications
              </Link>
            </div>
          </Panel>
        </section>
      </main>
    </>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
      <h2 className="mb-4 text-sm font-medium text-zinc-200">{title}</h2>
      {children}
    </section>
  );
}

function TaskList({
  tasks,
  empty,
  danger,
}: {
  tasks: Array<{
    id: string;
    title: string;
    projectId: string;
    projectName: string;
    dueDate: string | null;
    priority: string;
  }>;
  empty: string;
  danger?: boolean;
}) {
  if (tasks.length === 0) {
    return <p className="text-sm text-zinc-500">{empty}</p>;
  }

  return (
    <ul className="divide-y divide-zinc-800/80">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <Link
              href={`/projects/${task.projectId}/tasks/${task.id}`}
              className="truncate text-sm text-zinc-100 hover:underline"
            >
              {task.title}
            </Link>
            <p className="mt-0.5 text-xs text-zinc-500">{task.projectName}</p>
          </div>
          <span
            className={cn(
              "shrink-0 text-[11px] tabular-nums",
              danger ? "text-rose-400" : "text-zinc-500",
            )}
          >
            {task.dueDate?.slice(0, 10) ?? "—"}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Empty({
  text,
  href,
  label,
}: {
  text: string;
  href: string;
  label: string;
}) {
  return (
    <div className="text-sm text-zinc-500">
      {text}{" "}
      <Link href={href} className="text-violet-300 hover:underline">
        {label}
      </Link>
    </div>
  );
}
