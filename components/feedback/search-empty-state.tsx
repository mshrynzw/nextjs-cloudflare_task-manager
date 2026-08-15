"use client";

import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { useI18n } from "@/components/providers/locale-provider";

interface SearchEmptyStateProps {
  title?: string;
  description?: string;
  clearHref?: string;
}

export function SearchEmptyState({
  title,
  description,
  clearHref,
}: SearchEmptyStateProps) {
  const { t } = useI18n();

  return (
    <EmptyState
      title={title ?? t.empty.noMatchingResults}
      description={description ?? t.empty.tryClearing}
      icon={<SearchX className="size-6" aria-hidden />}
      actionHref={clearHref}
      actionLabel={clearHref ? t.empty.clearFilters : undefined}
    />
  );
}
