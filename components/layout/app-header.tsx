import Link from "next/link";
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <header className="flex flex-col gap-4 border-b border-[color:var(--border-subtle)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex items-start gap-3">
        <MobileNav />
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-[color:var(--text-primary)]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="hidden text-xs text-[color:var(--text-muted)] lg:inline-flex">
              <span className="inline-flex items-center gap-1">
                <kbd className="rounded border border-zinc-700 px-1.5 py-0.5 font-mono text-[10px]">
                  Ctrl
                </kbd>
                <kbd className="rounded border border-zinc-700 px-1.5 py-0.5 font-mono text-[10px]">
                  K
                </kbd>
              </span>
            </TooltipTrigger>
            <TooltipContent>Open command palette</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div className="hidden text-right text-xs sm:block">
          <Link
            href="/profile"
            className="font-medium text-zinc-200 hover:text-[color:var(--accent-1)]"
          >
            {userName ?? userEmail ?? "User"}
          </Link>
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
