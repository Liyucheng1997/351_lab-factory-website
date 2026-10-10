import type { MetadataRoute } from "next";
import { absUrl } from "@/content/company";
import { LOCALES } from "@/content/i18n";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const langs = Object.fromEntries(LOCALES.map((l) => [l, absUrl(`${l}/`)]));
  return LOCALES.map((l) => ({
    url: absUrl(`${l}/`),
    changeFrequency: "monthly",
    priority: l === "it" ? 1 : 0.8,
    alternates: { languages: langs },
  }));
}
