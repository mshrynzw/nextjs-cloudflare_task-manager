import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function TaskNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="text-xl font-semibold text-zinc-50">Task not found</h1>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        This task does not exist or you do not have permission to view it.
      </p>
      <Link href="/projects" className={cn(buttonVariants({ size: "lg" }), "mt-6")}>
        Back to projects
      </Link>
    </main>
  );
}
