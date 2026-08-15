"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { ErrorState } from "@/components/feedback/error-state";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { getUserFacingError } from "@/lib/ui/error-messages";
import { buttonVariants } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/dictionary";
import { parseLocale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const locale = useMemo(() => {
    if (typeof document === "undefined") {
      return parseLocale(undefined);
    }
    return parseLocale(document.documentElement.lang);
  }, []);
  const t = getDictionary(locale);
  const facing = getUserFacingError(error, locale);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-zinc-950 text-zinc-50 antialiased">
        <LocaleProvider locale={locale}>
          <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-10">
            <ErrorState
              variant={facing.variant}
              title={facing.title}
              description={facing.description}
              onRetry={reset}
              retryLabel={t.errors.tryAgain}
            />
            <p className="mt-4 text-center">
              <Link href="/login" className={cn(buttonVariants({ variant: "link" }))}>
                {t.errors.backToLogin}
              </Link>
            </p>
          </main>
        </LocaleProvider>
      </body>
    </html>
  );
}
