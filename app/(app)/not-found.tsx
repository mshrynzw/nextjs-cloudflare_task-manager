import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AppNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
        404
      </p>
      <h1 className="mt-2 text-xl font-semibold text-zinc-50">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        This page does not exist, or you do not have permission to view it.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/dashboard" className={cn(buttonVariants({ size: "lg" }))}>
          Dashboard
        </Link>
        <Link
          href="/projects"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          Projects
        </Link>
      </div>
    </main>
  );
}
