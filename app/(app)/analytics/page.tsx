import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { SimpleBarChart } from "@/components/feedback/simple-bar-chart";
import { StatCard } from "@/components/feedback/stat-card";
import { getDb } from "@/lib/db/server";
import { getI18n } from "@/lib/i18n/get-i18n";
import { interpolate } from "@/lib/i18n/interpolate";
import { taskPriorityLabel, taskStatusLabel } from "@/lib/i18n/labels";
import { getAnalyticsPageData } from "@/lib/services/analytics-service";

const STATUS_COLORS: Record<string, string> = {
  backlog: "#71717a",
  todo: "#60a5fa",
  in_progress: "#a78bfa",
  review: "#fbbf24",
  done: "#34d399",
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "#fb7185",
  medium: "#60a5fa",
  low: "#a1a1aa",
};

export default async function AnalyticsPage() {
  const session = await auth();
  const { t } = await getI18n();
  const userId = session!.user!.id!;
  const { overview, trend, distribution, workload, priorities } =
    await getAnalyticsPageData(getDb(), userId);

  const trendMax = Math.max(
    ...trend.flatMap((item) => [item.created, item.completed]),
    1,
  );

  return (
    <>
      <AppHeader
        title={t.analytics.title}
        description={t.analytics.description}
        userName={session?.user?.name}
        userEmail={session?.user?.email}
      />
      <main className="flex-1 space-y-6 px-4 py-6 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label={t.analytics.totalTasks} value={overview.totalTasks} />
          <StatCard label={t.analytics.completed} value={overview.completedTasks} />
          <StatCard
            label={t.analytics.completionRate}
            value={`${overview.completionRate}%`}
          />
          <StatCard label={t.analytics.overdue} value={overview.overdueTasks} />
          <StatCard
            label={t.analytics.activeAssignees}
            value={overview.activeMembers}
          />
          <StatCard
            label={t.analytics.avgCompletion}
            value={overview.averageCompletionTime}
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Panel title={t.analytics.trend}>
            <div className="flex h-40 items-end gap-1">
              {trend.map((item) => (
                <div
                  key={item.date}
                  className="flex flex-1 flex-col items-center justify-end gap-1"
                  title={interpolate(t.analytics.trendTitle, {
                    date: item.date,
                    created: item.created,
                    completed: item.completed,
                  })}
                >
                  <div className="flex w-full items-end gap-0.5" style={{ height: "100%" }}>
                    <div
                      className="w-1/2 rounded-t bg-zinc-600"
                      style={{
                        height: `${(item.created / trendMax) * 100}%`,
                        minHeight: item.created > 0 ? 4 : 0,
                      }}
                    />
                    <div
                      className="w-1/2 rounded-t bg-violet-400"
                      style={{
                        height: `${(item.completed / trendMax) * 100}%`,
                        minHeight: item.completed > 0 ? 4 : 0,
                      }}
                    />
                  </div>
                  <span className="text-[9px] text-zinc-600">
                    {item.date.slice(8)}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-zinc-500">{t.analytics.trendLegend}</p>
          </Panel>

          <Panel title={t.analytics.distribution}>
            <SimpleBarChart
              items={distribution.map((item) => ({
                label: taskStatusLabel(t, item.status),
                value: item.count,
                color: STATUS_COLORS[item.status],
              }))}
            />
          </Panel>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Panel title={t.analytics.priorityBreakdown}>
            <SimpleBarChart
              items={priorities.map((item) => ({
                label: taskPriorityLabel(t, item.priority),
                value: item.count,
                color: PRIORITY_COLORS[item.priority],
              }))}
            />
          </Panel>

          <Panel title={t.analytics.workload}>
            {workload.length === 0 ? (
              <p className="text-sm text-zinc-500">{t.analytics.emptyWorkload}</p>
            ) : (
              <ul className="space-y-3">
                {workload.map((member) => (
                  <li key={member.userId}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-zinc-200">{member.name}</span>
                      <span className="text-xs tabular-nums text-zinc-500">
                        {member.completedTasks}/{member.assignedTasks}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-emerald-400/80"
                        style={{
                          width: `${
                            member.assignedTasks === 0
                              ? 0
                              : Math.round(
                                  (member.completedTasks /
                                    member.assignedTasks) *
                                    100,
                                )
                          }%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
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
