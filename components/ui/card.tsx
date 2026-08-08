import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[color:var(--border-subtle)] bg-[color:var(--surface-card)] p-5 shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-200 ease-[var(--ease-out)]",
        interactive &&
          "hover:-translate-y-0.5 hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-pop)] motion-reduce:transform-none",
        className,
      )}
      {...props}
    />
  );
}
