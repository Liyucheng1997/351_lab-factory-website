import { it, type Dict } from "./dict/it";
import { en } from "./dict/en";
import { zh } from "./dict/zh";

export const LOCALES = ["it", "en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "it";

const DICTS: Record<Locale, Dict> = { it, en, zh };

export const hasLocale = (l: string): l is Locale => (LOCALES as readonly string[]).includes(l);
export const getDict = (l: Locale): Dict => DICTS[l];

/** 语言切换里显示的简称 */
export const LOCALE_LABEL: Record<Locale, string> = { it: "IT", en: "EN", zh: "中文" };
/** <html lang> / Open Graph 用 */
export const HTML_LANG: Record<Locale, string> = { it: "it", en: "en", zh: "zh" };
export const OG_LOCALE: Record<Locale, string> = { it: "it_IT", en: "en_GB", zh: "zh_CN" };

export type { Dict };
