import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-zinc-800/80 motion-reduce:animate-none",
        className,
      )}
      aria-hidden
    />
  );
}

export function PageSkeleton() {
  return (
    <div className="flex-1 space-y-4 px-4 py-6 sm:px-6" aria-busy="true">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    </div>
  );
}

export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5",
        className,
      )}
      aria-hidden
    >
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="size-3 rounded-full" />
        <Skeleton className="h-5 w-40" />
      </div>
      <Skeleton className="mb-3 h-4 w-full" />
      <Skeleton className="mb-6 h-4 w-[66%]" />
      <Skeleton className="h-2 w-full" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-zinc-800/80"
      aria-busy="true"
    >
      <div className="border-b border-zinc-800/80 bg-zinc-900/60 px-4 py-3">
        <Skeleton className="h-4 w-32" />
      </div>
      <ul className="divide-y divide-zinc-800/80">
        {Array.from({ length: rows }).map((_, index) => (
          <li key={index} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-4 w-12" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TaskSkeleton() {
  return (
    <div
      className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 p-3"
      aria-hidden
    >
      <Skeleton className="mb-3 h-4 w-3/4" />
      <Skeleton className="mb-3 h-3 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-5 w-16" />
      </div>
    </div>
  );
}

export function BoardSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden pb-4" aria-busy="true">
      {Array.from({ length: 3 }).map((_, column) => (
        <div
          key={column}
          className="flex w-full flex-col rounded-2xl border border-zinc-800/80 bg-zinc-900/40 md:w-72 md:shrink-0"
        >
          <div className="border-b border-zinc-800/80 px-3 py-3">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-2 p-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <TaskSkeleton key={index} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
