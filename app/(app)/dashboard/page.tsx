import Link from "next/link";
import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { StatCard } from "@/components/feedback/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { ProgressBar } from "@/features/project/components/progress-bar";
import { getDb } from "@/lib/db/server";
import { getI18n, intlLocale } from "@/lib/i18n/get-i18n";
import { interpolate } from "@/lib/i18n/interpolate";
import { activityLabel } from "@/lib/i18n/labels";
import { getDashboardOverview } from "@/lib/services/dashboard-service";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;
  const [{ locale, t }, data] = await Promise.all([
    getI18n(),
    getDashboardOverview(getDb(), userId),
  ]);
  const firstName =
    session?.user?.name?.split(" ")[0] ??
    session?.user?.email ??
    t.dashboard.welcomeFallback;

  return (
    <>
      <AppHeader
        title={t.dashboard.title}
        description={interpolate(t.dashboard.welcome, { name: firstName })}
        userName={session?.user?.name}
        userEmail={session?.user?.email}
      />
      <main className="flex-1 space-y-6 px-4 py-6 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t.dashboard.todayTasks} value={data.kpis.todayTasks} />
          <StatCard
            label={t.dashboard.completedToday}
            value={data.kpis.completedToday}
          />
          <StatCard
            label={t.dashboard.completionRate}
            value={`${data.kpis.completionRate}%`}
          />
          <StatCard
            label={t.dashboard.overdue}
            value={data.kpis.overdueTasks}
            hint={interpolate(t.dashboard.openTasksHint, {
              count: data.kpis.openTasks,
            })}
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Panel title={t.dashboard.todayTasksPanel}>
            <TaskList
              tasks={data.todayTasks}
              empty={t.dashboard.emptyToday}
              dash={t.common.dash}
            />
          </Panel>
          <Panel title={t.dashboard.overduePanel}>
            <TaskList
              tasks={data.overdueTasks}
              empty={t.dashboard.emptyOverdue}
              dash={t.common.dash}
              danger
            />
          </Panel>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Panel title={t.dashboard.projectProgress}>
            {data.projects.length === 0 ? (
              <Empty
                text={t.dashboard.emptyProjects}
                href="/projects"
                label={t.dashboard.createOne}
              />
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
                    <ProgressBar
                      value={project.progress}
                      label={t.common.progress}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={t.dashboard.upcoming}>
            <TaskList
              tasks={data.upcomingTasks}
              empty={t.dashboard.emptyUpcoming}
              dash={t.common.dash}
            />
          </Panel>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <Panel title={t.dashboard.recentActivity}>
            {data.activities.length === 0 ? (
              <p className="text-sm text-zinc-500">{t.dashboard.emptyActivity}</p>
            ) : (
              <ul className="space-y-3">
                {data.activities.map((item) => (
                  <li key={item.id} className="text-sm text-zinc-400">
                    <span className="text-zinc-200">
                      {item.userName ?? t.common.someone}
                    </span>{" "}
                    {activityLabel(t, item.action)}
                    {item.projectName ? (
                      <>
                        {" "}
                        <Link
                          href={`/projects/${item.projectId}`}
                          className="text-violet-300 hover:underline"
                        >
                          {item.projectName}
                        </Link>
                      </>
                    ) : null}
                    <span className="mt-0.5 block text-[11px] tabular-nums text-zinc-600">
                      {new Date(item.createdAt * 1000).toLocaleString(
                        intlLocale(locale),
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={t.dashboard.quickActions}>
            <div className="flex flex-col gap-2">
              <Link
                href="/projects"
                className={cn(buttonVariants({ size: "lg" }), "justify-start")}
              >
                {t.dashboard.browseProjects}
              </Link>
              <Link
                href="/calendar"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "justify-start",
                )}
              >
                {t.dashboard.openCalendar}
              </Link>
              <Link
                href="/analytics"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "justify-start",
                )}
              >
                {t.dashboard.viewAnalytics}
              </Link>
              <Link
                href="/notifications"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "justify-start",
                )}
              >
                {t.dashboard.notifications}
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
  dash,
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
  dash: string;
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
            {task.dueDate?.slice(0, 10) ?? dash}
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
