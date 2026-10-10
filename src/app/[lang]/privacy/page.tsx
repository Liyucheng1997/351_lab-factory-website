import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo } from "@/components/Logo";
import { COMPANY, absUrl } from "@/content/company";
import { getDict, hasLocale } from "@/content/i18n";

export async function generateMetadata({ params }: PageProps<"/[lang]/privacy">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDict(lang).privacy.title, alternates: { canonical: absUrl(`${lang}/privacy/`) } };
}

export default async function Privacy({ params }: PageProps<"/[lang]/privacy">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDict(lang);
  const fill = (s: string) => s.replace("{company}", COMPANY.legalName).replace("{city}", `${COMPANY.city} (${COMPANY.province})`);
  return (
    <main id="main" className="min-h-svh">
      <header className="border-b border-line bg-page/80 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-3xl items-center justify-between px-5">
          <Link href={`/${lang}`}>
            <Logo />
          </Link>
          <Link href={`/${lang}`} className="link text-[0.85rem]">
            ‹ {t.privacy.back}
          </Link>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-5 py-16 md:py-24">
        <h1 className="text-4xl font-semibold tracking-[-0.025em] md:text-5xl">{t.privacy.title}</h1>
        <p className="mt-3 text-sm text-ink-3">{t.privacy.updated}</p>
        <div className="card mt-10 space-y-8 p-7 md:p-10">
          {t.privacy.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-lg font-semibold">{s.h}</h2>
              <p className="mt-2 leading-relaxed text-ink-2">{fill(s.p)}</p>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
