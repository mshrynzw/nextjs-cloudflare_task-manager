"use client";

import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

export type ErrorStateVariant =
  | "generic"
  | "network"
  | "permission"
  | "auth"
  | "not-found"
  | "database";

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
  retryLabel,
  backHref,
  backLabel,
  className,
}: ErrorStateProps) {
  const { t } = useI18n();
  const copy = {
    generic: {
      title: t.errors.genericTitle,
      description: t.errors.genericDescription,
    },
    network: {
      title: t.errors.networkTitle,
      description: t.errors.networkDescription,
    },
    permission: {
      title: t.errors.permissionTitle,
      description: t.errors.permissionDescription,
    },
    auth: {
      title: t.errors.authTitle,
      description: t.errors.authDescription,
    },
    "not-found": {
      title: t.errors.notFoundTitle,
      description: t.errors.notFoundDescription,
    },
    database: {
      title: t.errors.databaseTitle,
      description: t.errors.databaseDescription,
    },
  }[variant];

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
            {retryLabel ?? t.errors.tryAgain}
          </Button>
        ) : null}
        {backHref ? (
          <Link
            href={backHref}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            {backLabel ?? t.errors.goBack}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
