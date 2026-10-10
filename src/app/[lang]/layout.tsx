import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { COMPANY, absUrl, fullAddress } from "@/content/company";
import { HTML_LANG, LOCALES, OG_LOCALE, getDict, hasLocale } from "@/content/i18n";
import "../globals.css";

export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#f5f5f7",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDict(lang);
  return {
    title: { default: t.meta.title, template: `%s · ${COMPANY.brand}` },
    description: t.meta.description,
    alternates: {
      canonical: absUrl(`${lang}/`),
      languages: { ...Object.fromEntries(LOCALES.map((l) => [l, absUrl(`${l}/`)])), "x-default": absUrl("it/") },
    },
    openGraph: {
      type: "website",
      siteName: COMPANY.legalName,
      title: t.meta.title,
      description: t.meta.description,
      locale: OG_LOCALE[lang],
      url: absUrl(`${lang}/`),
      images: [{ url: absUrl(`og/og-${lang}.jpg`), width: 1200, height: 630, alt: t.hero.caption }],
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description, images: [absUrl(`og/og-${lang}.jpg`)] },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDict(lang);

  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY.legalName,
    alternateName: COMPANY.brand,
    description: t.meta.description,
    url: absUrl(`${lang}/`),
    ...(COMPANY.email && { email: COMPANY.email }),
    ...(COMPANY.phone && { telephone: COMPANY.phone }),
    ...(COMPANY.vat && { vatID: COMPANY.vat }),
    address: {
      "@type": "PostalAddress",
      ...(COMPANY.street && { streetAddress: COMPANY.street }),
      ...(COMPANY.postalCode && { postalCode: COMPANY.postalCode }),
      addressLocality: COMPANY.city,
      addressRegion: COMPANY.province,
      addressCountry: COMPANY.country,
    },
    numberOfEmployees: { "@type": "QuantitativeValue", value: COMPANY.people },
    ...(fullAddress() && { location: fullAddress() }),
  };

  return (
    <html lang={HTML_LANG[lang]} suppressHydrationWarning>
      <head>
        {/* 有 JS 才启用进场动画，没 JS 内容照常显示 */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      </head>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:shadow">
          {t.skip}
        </a>
        {children}
      </body>
    </html>
  );
}
