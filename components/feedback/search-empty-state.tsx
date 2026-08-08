import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";

interface SearchEmptyStateProps {
  title?: string;
  description?: string;
  clearHref?: string;
}

export function SearchEmptyState({
  title = "No matching results",
  description = "Try clearing search or filters.",
  clearHref,
}: SearchEmptyStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={<SearchX className="size-6" aria-hidden />}
      actionHref={clearHref}
      actionLabel={clearHref ? "Clear filters" : undefined}
    />
  );
}
