"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/components/providers/locale-provider";
import { interpolate } from "@/lib/i18n/interpolate";
import { cn } from "@/lib/utils";

interface ProjectPaginationProps {
  page: number;
  limit: number;
  total: number;
  searchParams: Record<string, string | undefined>;
}

export function ProjectPagination({
  page,
  limit,
  total,
  searchParams,
}: ProjectPaginationProps) {
  const { t } = useI18n();
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) {
    return null;
  }

  function hrefFor(nextPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) {
        params.set(key, value);
      }
    }
    params.set("page", String(nextPage));
    return `/projects?${params.toString()}`;
  }

  return (
    <nav
      aria-label={t.projects.paginationNav}
      className="mt-8 flex items-center justify-between gap-3 border-t border-zinc-800/80 pt-4"
    >
      <p className="text-xs text-zinc-500">
        {interpolate(t.projects.pagination, { page, totalPages, total })}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={hrefFor(page - 1)}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            {t.common.previous}
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none opacity-40",
            )}
          >
            {t.common.previous}
          </span>
        )}
        {page < totalPages ? (
          <Link
            href={hrefFor(page + 1)}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            {t.common.next}
          </Link>
        ) : (
          <span
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "pointer-events-none opacity-40",
            )}
          >
            {t.common.next}
          </span>
        )}
      </div>
    </nav>
  );
}
