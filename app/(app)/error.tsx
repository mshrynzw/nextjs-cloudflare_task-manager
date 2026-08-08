"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/feedback/error-state";
import { getUserFacingError } from "@/lib/ui/error-messages";

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: AppErrorProps) {
  const facing = getUserFacingError(error);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col px-4 py-10 sm:px-6">
      <ErrorState
        variant={facing.variant}
        title={facing.title}
        description={facing.description}
        onRetry={reset}
        backHref="/dashboard"
        backLabel="Back to dashboard"
      />
    </main>
  );
}
