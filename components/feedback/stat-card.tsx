import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4",
        className,
      )}
    >
      <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-50">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}
