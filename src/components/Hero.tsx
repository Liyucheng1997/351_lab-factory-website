"use client";

import { useCallback, useRef, useState } from "react";
import type { Dict } from "@/content/i18n";
import { FactoryCanvas, type LabelPoints } from "./FactoryCanvas";
import type { ZoneId } from "./factory3d/showcase";

const ZONES: ZoneId[] = ["cutting", "sewing", "pressing", "quality"];

export function Hero({ t }: { t: Dict }) {
  const h = t.hero;
  const labelRefs = useRef<Partial<Record<ZoneId, HTMLButtonElement | null>>>({});
  const [ready, setReady] = useState(false);
  const [shot, setShot] = useState(0);

  const onLabels = useCallback((pts: LabelPoints) => {
    for (const id of ZONES) {
      const el = labelRefs.current[id];
      const p = pts[id];
      if (el && p) el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
    }
  }, []);
  const onReady = useCallback(() => setTimeout(() => setReady(true), 1200), []);

  const [line1, line2] = h.title.split("\n");

  return (
    <section id="top" className="overflow-hidden pt-12">
      <div className="mx-auto max-w-[1080px] px-6 pt-9 text-center md:pt-14">
        <p className="fade-in text-[0.85rem] font-semibold text-ink-2 sm:text-[0.95rem]">
          {h.eyebrow}
        </p>
        <h1 style={{ "--d": "60ms" } as React.CSSProperties} className="fade-in mt-2.5 text-balance text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-6xl sm:leading-[1.07] lg:text-[4rem]">
          {line1}
          <br />
          <span className="text-ink-3">{line2}</span>
        </h1>
        <p style={{ "--d": "120ms" } as React.CSSProperties} className="fade-in mx-auto mt-4 max-w-xl text-balance text-[1.05rem] leading-relaxed text-ink-2 sm:mt-5 sm:text-lg md:text-xl">
          {h.lead}
        </p>
        <div style={{ "--d": "180ms" } as React.CSSProperties} className="fade-in mt-6 flex flex-col items-center justify-center gap-x-6 gap-y-3 sm:mt-7 sm:flex-row">
          <a href="#contatti" className="btn btn-primary">
            {h.cta}
          </a>
          <a href="#laboratorio" className="link text-[1.05rem]">
            {h.more} ›
          </a>
        </div>
      </div>

      {/* 3D 工厂 */}
      <div className="relative mx-3 mt-5 h-[88vw] max-h-[460px] min-h-[300px] overflow-hidden rounded-[24px] sm:h-[62vw] md:mx-auto md:mt-4 md:h-[min(58vh,600px)] md:max-h-none md:w-[calc(100%-2.5rem)] md:max-w-[1360px] md:rounded-[28px]">
        <FactoryCanvas className="absolute inset-0" shot={shot} onLabels={onLabels} onReady={onReady} ariaLabel={h.caption} />
        <div aria-hidden={shot !== 0} className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${ready && shot === 0 ? "opacity-100" : "opacity-0"}`}>
          {ZONES.map((id, i) => (
            <button
              key={id}
              type="button"
              tabIndex={ready && shot === 0 ? 0 : -1}
              ref={(el) => void (labelRefs.current[id] = el)}
              onClick={() => setShot(i + 1)}
              className="absolute left-0 top-0 will-change-transform"
            >
              <span className="pointer-events-auto block -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-full bg-white/90 px-3 py-1 text-[0.75rem] font-medium text-ink shadow-[0_2px_10px_rgba(0,0,0,0.12)] backdrop-blur transition-colors hover:bg-white hover:text-primary max-sm:scale-90">
                {h.zones[id]}
              </span>
            </button>
          ))}
        </div>
        <p
          className={`pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.7rem] text-ink-3 transition-opacity duration-500 md:left-auto md:right-5 md:translate-x-0 md:text-xs ${
            ready && shot === 0 ? "opacity-100" : "opacity-0"
          }`}
        >
          ‹ {h.drag} ›
        </p>
      </div>

      {/* 分段控件：切换车间 */}
      <div className="mx-auto max-w-[1080px] pb-12 pt-4 text-center md:px-5 md:pb-20">
        <div className="no-scrollbar overflow-x-auto px-4 md:px-0">
        <div role="tablist" aria-label={h.caption} className="inline-flex rounded-full bg-fill p-1">
          {h.tabs.map((label, i) => (
            <button
              key={label}
              role="tab"
              type="button"
              aria-selected={shot === i}
              onClick={() => setShot(i)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[0.8rem] transition-all duration-200 sm:px-5 sm:text-[0.82rem] ${
                shot === i ? "bg-white font-medium text-ink shadow-[0_1px_4px_rgba(0,0,0,0.12)]" : "text-ink-2 hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        </div>
        <p aria-live="polite" className="mx-auto mt-4 min-h-[4.5em] max-w-lg text-balance px-6 text-[0.92rem] leading-relaxed text-ink-2 sm:min-h-[3em] sm:text-[0.95rem]">
          {h.notes[shot]}
        </p>
      </div>
    </section>
  );
}
