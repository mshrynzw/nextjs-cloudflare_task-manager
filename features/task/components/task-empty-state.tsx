"use client";

import Link from "next/link";
import { ListTodo } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

interface TaskEmptyStateProps {
  projectId: string;
  size?: "default" | "compact";
}

export function TaskEmptyState({
  projectId,
  size = "default",
}: TaskEmptyStateProps) {
  const { t } = useI18n();

  return (
    <EmptyState
      size={size}
      title={t.task.emptyTitle}
      description={t.task.emptyDescription}
      icon={<ListTodo className={size === "compact" ? "size-5" : "size-6"} aria-hidden />}
      action={
        <Link
          href={`/projects/${projectId}/board`}
          className={cn(buttonVariants({ size: size === "compact" ? "default" : "lg" }))}
        >
          {t.project.openBoard}
        </Link>
      }
    />
  );
}
