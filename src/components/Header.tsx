"use client";

import Link from "next/link";
import { LOCALES, LOCALE_LABEL, type Dict, type Locale } from "@/content/i18n";
import { Logo } from "./Logo";

/** 苹果式细导航栏：半透明毛玻璃，一直固定在顶上 */
export function Header({ t, lang }: { t: Dict; lang: Locale }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.06] bg-page/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-12 max-w-[1080px] items-center justify-between px-4 sm:px-5">
        <Link href={`/${lang}`} aria-label="LGF — home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-4 text-[0.8rem] text-ink/80 sm:gap-7" aria-label="Main">
          <a href="#laboratorio" className="hidden hover:text-ink sm:inline">
            {t.nav.about}
          </a>
          <a href="#contatti" className="hidden hover:text-ink sm:inline">
            {t.nav.contact}
          </a>
          <span className="flex items-center gap-2.5">
            {LOCALES.map((l) => (
              <Link
                key={l}
                href={`/${l}`}
                hrefLang={l}
                aria-current={l === lang ? "true" : undefined}
                className={l === lang ? "font-medium text-ink" : "text-ink-3 hover:text-ink"}
              >
                {LOCALE_LABEL[l]}
              </Link>
            ))}
          </span>
          <a href="#contatti" className="btn btn-primary btn-sm">
            {t.nav.cta}
          </a>
        </nav>
      </div>
    </header>
  );
}
