"use client";

import { useLayoutEffect } from "react";
import {
  appearanceDataAttributes,
  resolveThemeClass,
  type AppearanceSettings,
} from "@/lib/ui/appearance";

interface AppearanceProviderProps {
  settings: AppearanceSettings;
  children: React.ReactNode;
}

export function AppearanceProvider({
  settings,
  children,
}: AppearanceProviderProps) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const attrs = appearanceDataAttributes(settings);

    root.dataset.accent = attrs["data-accent"];
    root.dataset.density = attrs["data-density"];
    root.dataset.animations = attrs["data-animations"];
    root.dataset.theme = attrs["data-theme"];

    function applyTheme(prefersDark: boolean) {
      const mode = resolveThemeClass(settings.theme, prefersDark);
      root.classList.toggle("dark", mode === "dark");
      root.classList.toggle("light", mode === "light");
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    applyTheme(media.matches);

    function onChange(event: MediaQueryListEvent) {
      if (settings.theme === "system") {
        applyTheme(event.matches);
      }
    }

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [settings]);

  return children;
}
