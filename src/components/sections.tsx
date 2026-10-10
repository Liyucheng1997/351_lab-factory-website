// 首页的静态版块（服务端组件）
import Link from "next/link";
import { CLIENTS, COMPANY } from "@/content/company";
import type { Dict, Locale } from "@/content/i18n";
import { IconQR, IconScissors, IconShield } from "./icons";

const ICONS = [IconScissors, IconQR, IconShield];
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

export function About({ t }: { t: Dict }) {
  const a = t.about;
  return (
    <section id="laboratorio" className="scroll-mt-12 bg-white py-14 md:py-28">
      <div className="mx-auto max-w-[1080px] px-5">
        <h2 data-reveal className="text-balance text-center text-[1.9rem] font-semibold leading-tight tracking-[-0.025em] md:text-5xl">
          {a.title}
        </h2>

        <dl className="mt-9 grid grid-cols-2 gap-y-7 md:mt-16 md:grid-cols-4">
          {a.stats.map((s, i) => (
            <div key={s.label} data-reveal style={delay(i * 60)} className="text-center">
              <dt className="sr-only">{s.label}</dt>
              <dd className="tabular text-4xl font-semibold tracking-[-0.03em] md:text-[3.25rem]">
                {s.value}
                {s.unit && <span className="ml-1 text-xl font-medium text-ink-3 md:text-2xl">{s.unit}</span>}
              </dd>
              <dd className="mt-1 text-[0.9rem] text-ink-2">{s.label}</dd>
            </div>
          ))}
        </dl>

        <ul className="mt-10 grid gap-3 md:mt-16 md:grid-cols-3 md:gap-4">
          {a.points.map((p, i) => {
            const Icon = ICONS[i];
            return (
              <li key={p.title} data-reveal style={delay(i * 80)} className="flex gap-4 rounded-[20px] bg-page p-5 md:block md:p-7">
                <Icon className="h-7 w-7 shrink-0 text-primary" />
                <div>
                <h3 className="text-[1.2rem] md:mt-5 font-semibold tracking-[-0.015em]">{p.title}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-2">{p.text}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <div data-reveal className="mt-10 flex flex-col items-center gap-3 md:mt-16 md:gap-4">
          <p className="text-[0.8rem] text-ink-3">{a.clients}</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-2 sm:gap-x-14">
            {CLIENTS.map((c) => (
              <li key={c} className="text-lg font-semibold tracking-[0.12em] text-ink/70 md:text-2xl">
                {c}
              </li>
            ))}
          </ul>
          <p className="text-[0.7rem] text-ink-3">{a.note}</p>
        </div>
      </div>
    </section>
  );
}

export function Footer({ t, lang }: { t: Dict; lang: Locale }) {
  return (
    <footer className="border-t border-line bg-page">
      <div className="mx-auto flex max-w-[1080px] flex-col gap-2 px-5 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-[0.75rem] leading-relaxed text-ink-3 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © 2026 {COMPANY.legalName} · {COMPANY.city} ({COMPANY.province}), Italia
          {COMPANY.vat && ` · ${t.footer.vat} ${COMPANY.vat}`} · {t.footer.rights}
        </p>
        <Link href={`/${lang}/privacy`} className="hover:text-ink">
          {t.footer.privacy}
        </Link>
      </div>
    </footer>
  );
}
