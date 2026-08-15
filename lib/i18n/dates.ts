import { enUS, ja } from "date-fns/locale";
import type { Locale } from "@/lib/i18n/locale";

export function dateFnsLocale(locale: Locale) {
  return locale === "ja" ? ja : enUS;
}

export function intlLocale(locale: Locale): string {
  return locale === "ja" ? "ja-JP" : "en-US";
}
