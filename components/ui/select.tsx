import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Select({
  className,
  children,
  ...props
}: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-9 w-full rounded-lg border border-zinc-800 bg-zinc-950/70 px-3 text-sm text-zinc-100 outline-none transition focus-visible:border-[color:var(--accent-ring)] focus-visible:ring-2 focus-visible:ring-[color:var(--accent-soft)] disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
