export default function ProjectsLoading() {
  return (
    <div className="flex-1 px-4 py-6 sm:px-6">
      <div className="mb-5 h-10 max-w-xl animate-pulse rounded-xl bg-zinc-900" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-52 animate-pulse rounded-2xl border border-zinc-800/80 bg-zinc-900/40"
          />
        ))}
      </div>
    </div>
  );
}
