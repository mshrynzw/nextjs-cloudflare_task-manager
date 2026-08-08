import Link from "next/link";
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  title: string;
  description?: string;
  userName?: string | null;
  userEmail?: string | null;
}

export function AppHeader({
  title,
  description,
  userName,
  userEmail,
}: AppHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-zinc-800/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-50">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
          <nav className="flex items-center gap-2 md:hidden" aria-label="Mobile">
          <Link
            href="/dashboard"
            className="rounded-lg px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          >
            Overview
          </Link>
          <Link
            href="/projects"
            className="rounded-lg px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          >
            Projects
          </Link>
          <Link
            href="/calendar"
            className="rounded-lg px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          >
            Calendar
          </Link>
        </nav>
        <div className="hidden text-right text-xs sm:block">
          <p className="font-medium text-zinc-200">
            {userName ?? userEmail ?? "User"}
          </p>
          {userEmail && userName ? (
            <p className="text-zinc-500">{userEmail}</p>
          ) : null}
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
