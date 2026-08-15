import { Suspense } from "react";
import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { SearchEmptyState } from "@/components/feedback/search-empty-state";
import { StaggerItem } from "@/components/feedback/stagger-item";
import { CreateProjectDialog } from "@/features/project/components/create-project-dialog";
import { ProjectCard } from "@/features/project/components/project-card";
import { ProjectEmptyState } from "@/features/project/components/project-empty-state";
import { ProjectPagination } from "@/features/project/components/project-pagination";
import { ProjectToolbar } from "@/features/project/components/project-toolbar";
import { listProjectsQuerySchema } from "@/lib/api/request-schemas";
import { getDb } from "@/lib/db/server";
import { getI18n } from "@/lib/i18n/get-i18n";
import {
  getProjects,
  getWorkspaceMembersForUser,
  resolveDefaultWorkspaceId,
} from "@/lib/services/project-service";

interface ProjectsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const session = await auth();
  const { t } = await getI18n();
  const raw = await searchParams;
  const query = listProjectsQuerySchema.parse({
    page: firstValue(raw.page),
    limit: firstValue(raw.limit) ?? "20",
    search: firstValue(raw.search),
    status: firstValue(raw.status),
    priority: firstValue(raw.priority),
    sort: firstValue(raw.sort) ?? "updatedAt",
    order: firstValue(raw.order) ?? "desc",
  });

  const result = await getProjects(getDb(), session!.user!.id!, query);
  const userId = session!.user!.id!;
  const workspaceId = await resolveDefaultWorkspaceId(getDb(), userId);
  const workspaceMembers = workspaceId
    ? await getWorkspaceMembersForUser(getDb(), userId, workspaceId)
    : [];
  const filterParams = {
    search: query.search,
    status: query.status,
    priority: query.priority,
    sort: query.sort,
    order: query.order,
    limit: String(query.limit),
  };

  return (
    <>
      <AppHeader
        title={t.projects.title}
        description={t.projects.description}
        userName={session?.user?.name}
        userEmail={session?.user?.email}
      />
      <main className="flex-1 px-4 py-6 sm:px-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <Suspense fallback={<div className="h-10 flex-1" />}>
            <div className="min-w-0 flex-1">
              <ProjectToolbar />
            </div>
          </Suspense>
          <CreateProjectDialog
            workspaceMembers={workspaceMembers}
            currentUserId={userId}
          />
        </div>

        {result.data.length === 0 ? (
          query.search || query.status || query.priority ? (
            <SearchEmptyState
              title={t.projects.noMatching}
              description={t.projects.noMatchingDescription}
              clearHref="/projects"
            />
          ) : (
            <ProjectEmptyState
              workspaceMembers={workspaceMembers}
              currentUserId={userId}
            />
          )
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {result.data.map((project, index) => (
                <StaggerItem key={project.id} index={index}>
                  <ProjectCard project={project} />
                </StaggerItem>
              ))}
            </div>
            <ProjectPagination
              page={result.meta.page}
              limit={result.meta.limit}
              total={result.meta.total}
              searchParams={filterParams}
            />
          </>
        )}
      </main>
    </>
  );
}
