"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ErrorState } from "@/components/feedback/error-state";
import { getUserFacingError } from "@/lib/ui/error-messages";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const facing = getUserFacingError(error);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-50 antialiased">
        <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-10">
          <ErrorState
            variant={facing.variant}
            title={facing.title}
            description={facing.description}
            onRetry={reset}
          />
          <p className="mt-4 text-center">
            <Link href="/login" className={cn(buttonVariants({ variant: "link" }))}>
              Back to login
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
