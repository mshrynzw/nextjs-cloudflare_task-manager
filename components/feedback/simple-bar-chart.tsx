import { cn } from "@/lib/utils";

interface BarChartProps {
  items: Array<{ label: string; value: number; color?: string }>;
  className?: string;
}

export function SimpleBarChart({ items, className }: BarChartProps) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item) => (
        <li key={item.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-zinc-400">{item.label}</span>
            <span className="tabular-nums text-zinc-300">{item.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full transition-[width]"
              style={{
                width: `${Math.round((item.value / max) * 100)}%`,
                backgroundColor: item.color ?? "#8b7cf8",
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
