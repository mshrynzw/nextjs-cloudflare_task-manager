import type { ReactNode } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  action?: ReactNode;
  className?: string;
  icon?: ReactNode;
  size?: "default" | "compact";
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  action,
  className,
  icon,
  size = "default",
}: EmptyStateProps) {
  const isCompact = size === "compact";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 text-center",
        isCompact ? "px-4 py-8" : "px-6 py-16",
        className,
      )}
    >
      {icon ? (
        <div
          className={cn(
            "mb-4 flex items-center justify-center rounded-xl bg-[color:var(--accent-soft)] text-[color:var(--accent-1)]",
            isCompact ? "size-10" : "size-12",
          )}
        >
          {icon}
        </div>
      ) : null}
      <h2
        className={cn(
          "font-medium text-zinc-100",
          isCompact ? "text-base" : "text-lg",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-2 max-w-sm text-zinc-500",
            isCompact ? "text-xs" : "text-sm",
          )}
        >
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
      {!action && actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className={cn(
            buttonVariants({ size: isCompact ? "default" : "lg" }),
            "mt-6",
          )}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
