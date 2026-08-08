export type AppearanceSettings = {
  theme: string;
  accentColor: string;
  density: string;
  animations: boolean;
};

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: "dark",
  accentColor: "violet",
  density: "comfortable",
  animations: true,
};

export function resolveThemeClass(
  theme: string,
  prefersDark = true,
): "dark" | "light" {
  if (theme === "light") {
    return "light";
  }
  if (theme === "dark") {
    return "dark";
  }
  return prefersDark ? "dark" : "light";
}

export function appearanceDataAttributes(settings: AppearanceSettings) {
  return {
    "data-accent": settings.accentColor || "violet",
    "data-density": settings.density || "comfortable",
    "data-animations": settings.animations ? "on" : "off",
    "data-theme": settings.theme || "dark",
  } as const;
}
