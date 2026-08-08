import Link from "next/link";
import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <>
      <AppHeader
        title="Overview"
        description="Your workspace at a glance."
        userName={session?.user?.name}
        userEmail={session?.user?.email}
      />
      <main className="flex-1 px-4 py-6 sm:px-6">
        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6">
          <h2 className="text-lg font-medium text-zinc-100">Welcome back</h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-400">
            Project management is ready. Open your projects to search, filter,
            and track progress.
          </p>
          <div className="mt-5">
            <Link
              href="/projects"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Open Projects
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
