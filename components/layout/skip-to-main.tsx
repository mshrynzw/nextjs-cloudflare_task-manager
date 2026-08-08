import { cn, focusRingClass } from "@/lib/utils";

/**
 * First focusable control for keyboard users to bypass chrome.
 * Place near the start of the document body / app shell.
 */
export function SkipToMain({
  href = "#main-content",
}: {
  href?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100]",
        "rounded-lg border border-[color:var(--border-subtle)] bg-[color:var(--bg-elevated)] px-3 py-2 text-sm font-medium text-[color:var(--text-primary)] shadow-[var(--shadow-pop)]",
        focusRingClass,
      )}
    >
      Skip to main content
    </a>
  );
}
