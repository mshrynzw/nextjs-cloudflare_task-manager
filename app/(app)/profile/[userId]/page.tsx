import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { StatCard } from "@/components/feedback/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { getInitials } from "@/features/project/utils/labels";
import { ApiError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/server";
import { getProfilePageData } from "@/lib/services/user-service";
import { cn } from "@/lib/utils";

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

const ACTION_LABELS: Record<string, string> = {
  task_created: "created a task",
  task_status_changed: "updated a task",
  task_assignee_changed: "changed an assignee",
  comment_added: "commented",
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await auth();
  const { userId } = await params;
  const actorId = session!.user!.id!;

  let data;
  try {
    data = await getProfilePageData(getDb(), actorId, userId);
  } catch (error) {
    if (error instanceof ApiError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  const { profile, isOwnProfile, stats, assignedTasks, projects, activities } =
    data;

  return (
    <>
      <AppHeader
        title={isOwnProfile ? "Your profile" : (profile.name ?? "Profile")}
        description="Member profile and activity."
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
            <li className="text-zinc-300">{profile.name ?? "Profile"}</li>
          </ol>
        </nav>

        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-16 items-center justify-center overflow-hidden rounded-2xl bg-zinc-800 text-lg font-semibold text-zinc-100">
                {profile.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.image}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  getInitials(profile.name)
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-zinc-50">
                  {profile.name ?? "Unnamed user"}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {profile.jobTitle ?? "No job title"}
                  {profile.username ? ` · @${profile.username}` : null}
                </p>
                {profile.bio ? (
                  <p className="mt-3 max-w-xl text-sm text-zinc-400">
                    {profile.bio}
                  </p>
                ) : null}
                {profile.website ? (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-sm text-violet-300 hover:underline"
                  >
                    {profile.website}
                  </a>
                ) : null}
                {isOwnProfile && profile.email ? (
                  <p className="mt-2 text-xs text-zinc-600">{profile.email}</p>
                ) : null}
              </div>
            </div>
            {isOwnProfile ? (
              <Link
                href="/settings/profile"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Edit profile
              </Link>
            ) : null}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Assigned tasks" value={stats.assignedTasks} />
          <StatCard label="Completed" value={stats.completedTasks} />
          <StatCard label="Projects" value={stats.projects} />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Panel title="Assigned tasks">
            {assignedTasks.length === 0 ? (
              <p className="text-sm text-zinc-500">No assigned tasks.</p>
            ) : (
              <ul className="divide-y divide-zinc-800/80">
                {assignedTasks.map((task) => (
                  <li key={task.id} className="py-3 first:pt-0 last:pb-0">
                    <Link
                      href={`/projects/${task.projectId}/tasks/${task.id}`}
                      className="text-sm text-zinc-100 hover:underline"
                    >
                      {task.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {task.projectName} · {task.status}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Projects">
            {projects.length === 0 ? (
              <p className="text-sm text-zinc-500">No projects.</p>
            ) : (
              <ul className="space-y-2">
                {projects.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/projects/${project.id}`}
                      className="flex items-center gap-2 text-sm text-zinc-100 hover:underline"
                    >
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: project.color }}
                        aria-hidden
                      />
                      {project.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </section>

        <Panel title="Recent activity">
          {activities.length === 0 ? (
            <p className="text-sm text-zinc-500">No recent activity.</p>
          ) : (
            <ul className="space-y-3">
              {activities.map((item) => (
                <li key={item.id} className="text-sm text-zinc-400">
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
