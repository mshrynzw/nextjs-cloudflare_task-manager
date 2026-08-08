"use client";

import dynamic from "next/dynamic";

/**
 * Client-only lazy load for Command Palette.
 * `ssr: false` is not allowed in Server Components (Next.js App Router).
 */
export const CommandPaletteLazy = dynamic(
  () =>
    import("@/components/layout/command-palette").then((mod) => ({
      default: mod.CommandPalette,
    })),
  { ssr: false },
);
