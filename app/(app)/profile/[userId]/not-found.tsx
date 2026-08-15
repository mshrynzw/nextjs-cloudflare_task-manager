import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { getI18n } from "@/lib/i18n/get-i18n";
import { cn } from "@/lib/utils";

export default async function ProfileNotFound() {
  const { t } = await getI18n();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="text-xl font-semibold text-zinc-50">
        {t.profile.notFoundTitle}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        {t.profile.notFoundDescription}
      </p>
      <Link
        href="/dashboard"
        className={cn(buttonVariants({ size: "lg" }), "mt-6")}
      >
        {t.profile.backToDashboard}
      </Link>
    </main>
  );
}
