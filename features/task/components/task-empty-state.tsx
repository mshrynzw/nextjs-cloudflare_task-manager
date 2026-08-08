import Link from "next/link";
import { ListTodo } from "lucide-react";
import { EmptyState } from "@/components/feedback/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TaskEmptyStateProps {
  projectId: string;
  size?: "default" | "compact";
}

export function TaskEmptyState({
  projectId,
  size = "default",
}: TaskEmptyStateProps) {
  return (
    <EmptyState
      size={size}
      title="No tasks yet"
      description="Open the board to create and organize tasks."
      icon={<ListTodo className={size === "compact" ? "size-5" : "size-6"} aria-hidden />}
      action={
        <Link
          href={`/projects/${projectId}/board`}
          className={cn(buttonVariants({ size: size === "compact" ? "default" : "lg" }))}
        >
          Open board
        </Link>
      }
    />
  );
}
