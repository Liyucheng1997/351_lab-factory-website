import type { MetadataRoute } from "next";
import { absUrl } from "@/content/company";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: absUrl("sitemap.xml") };
}
