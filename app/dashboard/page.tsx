import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Signed in as {session.user.email ?? session.user.name ?? "user"}
          </p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <Button type="submit" variant="outline">
            Sign out
          </Button>
        </form>
      </div>
      <p className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-400">
        Authentication is ready. Project and task screens will be built in later
        phases.
      </p>
    </main>
  );
}
