"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/feedback/error-state";
import { useI18n } from "@/components/providers/locale-provider";
import { getUserFacingError } from "@/lib/ui/error-messages";

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: AppErrorProps) {
  const { locale, t } = useI18n();
  const facing = getUserFacingError(error, locale);

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
        backLabel={t.errors.backToDashboard}
      />
    </main>
  );
}
