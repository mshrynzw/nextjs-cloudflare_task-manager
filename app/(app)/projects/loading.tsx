import { CardSkeleton } from "@/components/feedback/skeleton";

export default function ProjectsLoading() {
  return (
    <div className="flex-1 space-y-4 px-4 py-6 sm:px-6" aria-busy="true">
      <div className="h-10 max-w-xl animate-pulse rounded-xl bg-zinc-800/80" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
