"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ErrorStateVariant =
  | "generic"
  | "network"
  | "permission"
  | "auth"
  | "not-found"
  | "database";

const VARIANT_COPY: Record<
  ErrorStateVariant,
  { title: string; description: string }
> = {
  generic: {
    title: "Something went wrong",
    description: "An unexpected error occurred. You can try again or go back.",
  },
  network: {
    title: "Connection problem",
    description:
      "We could not reach the server. Check your network and try again.",
  },
  permission: {
    title: "Access denied",
    description: "You do not have permission to view this resource.",
  },
  auth: {
    title: "Sign in required",
    description: "Your session may have expired. Please sign in again.",
  },
  "not-found": {
    title: "Not found",
    description: "This page or resource does not exist, or is no longer available.",
  },
  database: {
    title: "Temporary data issue",
    description:
      "We could not load data right now. Please retry in a moment.",
  },
};

interface ErrorStateProps {
  variant?: ErrorStateVariant;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function ErrorState({
  variant = "generic",
  title,
  description,
  onRetry,
  retryLabel = "Try again",
  backHref,
  backLabel = "Go back",
  className,
}: ErrorStateProps) {
  const copy = VARIANT_COPY[variant];

  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-950/20 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300">
        <AlertTriangle className="size-6" aria-hidden />
      </div>
      <h2 className="text-lg font-medium text-zinc-100">
        {title ?? copy.title}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        {description ?? copy.description}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {onRetry ? (
          <Button type="button" onClick={onRetry}>
            <RefreshCw data-icon="inline-start" className="size-4" />
            {retryLabel}
          </Button>
        ) : null}
        {backHref ? (
          <Link
            href={backHref}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            {backLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
