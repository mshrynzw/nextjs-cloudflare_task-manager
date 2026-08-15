import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getI18n } from "@/lib/i18n/get-i18n";
import { cn } from "@/lib/utils";

export default async function AppNotFound() {
  const { t } = await getI18n();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
        404
      </p>
      <h1 className="mt-2 text-xl font-semibold text-zinc-50">
        {t.errors.pageNotFound}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        {t.errors.pageNotFoundDescription}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
          {t.common.dashboard}
        </Link>
        <Link
          href="/projects"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          {t.nav.projects}
        </Link>
      </div>
    </main>
  );
}
