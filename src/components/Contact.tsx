"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { COMPANY, FORM_ENDPOINT, fullAddress, mapsUrl } from "@/content/company";
import type { Dict, Locale } from "@/content/i18n";

type Status = "idle" | "sending" | "ok" | "mail" | "error";

export function Contact({ t, lang }: { t: Dict; lang: Locale }) {
  const c = t.contact;
  const f = c.form;
  const [status, setStatus] = useState<Status>("idle");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (data.website) return; // 防机器人：真人看不到这个框
    delete data.website;

    // 静态网站没有服务器：有表单服务就发过去，没有就打开访客自己的邮件程序
    if (!FORM_ENDPOINT) {
      if (!COMPANY.email) return setStatus("error");
      const subject = `Richiesta preventivo · ${data.company}`;
      const body = `${data.message}

${data.name}
${data.company}
${data.email}`;
      window.location.href = `mailto:${COMPANY.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      return setStatus("mail");
    }
    setStatus("sending");
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...data, lang, _subject: `Richiesta preventivo · ${data.company}`, _replyto: data.email }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const address = fullAddress() || `${COMPANY.city} (${COMPANY.province}), Italia`;
  const info: [string, React.ReactNode][] = [
    [c.info.address, address],
    ...(COMPANY.email ? [[c.info.email, <a key="e" className="link" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>] as [string, React.ReactNode]] : []),
    ...(COMPANY.phone ? [[c.info.phone, <a key="p" className="link" href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}>{COMPANY.phone}</a>] as [string, React.ReactNode]] : []),
    ...(COMPANY.whatsapp
      ? [[c.info.whatsapp, <a key="w" className="link" href={`https://wa.me/${COMPANY.whatsapp.replace(/[^\d]/g, "")}`} target="_blank" rel="noopener noreferrer">{COMPANY.whatsapp}</a>] as [string, React.ReactNode]]
      : []),
    ...(COMPANY.hours ? [[c.info.hours, COMPANY.hours] as [string, React.ReactNode]] : []),
  ];
  const label = "mb-1.5 block text-[0.8rem] text-ink-2";

  return (
    <section id="contatti" className="scroll-mt-12 py-14 md:py-28">
      <div className="mx-auto grid max-w-[1080px] gap-8 px-5 md:grid-cols-[1fr_1.15fr] md:gap-14">
        <div data-reveal>
          <h2 className="text-balance text-[1.9rem] font-semibold leading-tight tracking-[-0.025em] md:text-5xl">{c.title}</h2>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-ink-2">{c.lead}</p>
          <dl className="mt-8 space-y-4 text-[0.95rem]">
            {info.map(([k, v]) => (
              <div key={k}>
                <dt className="text-[0.8rem] text-ink-3">{k}</dt>
                <dd className="mt-0.5">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-[0.95rem]">
            <a href={mapsUrl()} target="_blank" rel="noopener noreferrer" className="link">
              {c.info.maps} ↗
            </a>
            <span className="text-ink-3">{c.info.visit}</span>
          </p>
        </div>

        <div data-reveal style={{ "--d": "80ms" } as React.CSSProperties} className="card p-5 sm:p-8">
          {status === "ok" || status === "mail" ? (
            <div role="status" className="flex min-h-[340px] flex-col items-center justify-center text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 11.5l4 4L17 7" />
                </svg>
              </span>
              <p className="mt-5 max-w-xs text-lg font-medium">{status === "ok" ? f.success : f.mailOpened}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className={label}>{f.name}</span>
                <input name="name" required autoComplete="name" className="field" />
              </label>
              <label>
                <span className={label}>{f.company}</span>
                <input name="company" required autoComplete="organization" className="field" />
              </label>
              <label className="sm:col-span-2">
                <span className={label}>{f.email}</span>
                <input name="email" type="email" required autoComplete="email" className="field" />
              </label>
              <label className="sm:col-span-2">
                <span className={label}>{f.message}</span>
                <textarea name="message" rows={4} placeholder={f.messagePlaceholder} className="field resize-y" />
              </label>
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
              <label className="flex items-start gap-2.5 text-[0.8rem] leading-relaxed text-ink-2 sm:col-span-2">
                <input type="checkbox" required className="mt-[3px] h-4 w-4 shrink-0" />
                <span>
                  {f.privacy}{" "}
                  <Link href={`/${lang}/privacy`} target="_blank" className="link">
                    {f.privacyLink}
                  </Link>
                </span>
              </label>
              <div className="sm:col-span-2">
                <button type="submit" disabled={status === "sending"} className="btn btn-primary w-full disabled:opacity-60">
                  {status === "sending" ? f.sending : f.submit}
                </button>
              </div>
              {status === "error" && (
                <p role="alert" className="rounded-xl bg-[#fdeceb] px-4 py-3 text-[0.85rem] text-[#d70015] sm:col-span-2">
                  {f.error}{" "}
                  {COMPANY.email ? (
                    <>
                      {f.errorMail}{" "}
                      <a className="underline" href={`mailto:${COMPANY.email}`}>
                        {COMPANY.email}
                      </a>
                    </>
                  ) : (
                    f.errorCall
                  )}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
