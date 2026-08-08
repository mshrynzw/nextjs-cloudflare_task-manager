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
import { getProjects } from "@/lib/services/project-service";

interface ProjectsPageProps {
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

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const session = await auth();
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
        title="Projects"
        description="Search, filter, and manage your projects."
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
          <CreateProjectDialog />
        </div>

        {result.data.length === 0 ? (
          query.search || query.status || query.priority ? (
            <SearchEmptyState
              title="No matching projects"
              description="Try clearing search or filters."
              clearHref="/projects"
            />
          ) : (
            <ProjectEmptyState />
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
