import { cookies } from "next/headers";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Dictionary } from "@/lib/i18n/ja";
import { LOCALE_COOKIE, parseLocale, type Locale } from "@/lib/i18n/locale";

export { dateFnsLocale, intlLocale } from "@/lib/i18n/dates";

export async function getRequestLocale(): Promise<Locale> {
  const store = await cookies();
  return parseLocale(store.get(LOCALE_COOKIE)?.value);
}

export async function getI18n(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getRequestLocale();
  return { locale, t: getDictionary(locale) };
}
