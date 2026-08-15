import { en as enDict } from "@/lib/i18n/en";
import { ja as jaDict, type Dictionary } from "@/lib/i18n/ja";
import type { Locale } from "@/lib/i18n/locale";

const dictionaries: Record<Locale, Dictionary> = {
  ja: jaDict,
  en: enDict,
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
