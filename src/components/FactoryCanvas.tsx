"use client";

// 3D 工厂画布：靠近视口才加载 three.js（不拖慢首屏），离开视口 / 切到后台就暂停渲染。
import { useEffect, useRef, useState } from "react";
import type { FactoryShowcase, ZoneId } from "./factory3d/showcase";

export type LabelPoints = Record<ZoneId, { x: number; y: number; visible: boolean }>;

type Props = {
  shot?: number;
  className?: string;
  onLabels?: (pts: LabelPoints) => void;
  onReady?: () => void;
  ariaLabel?: string;
};

export function FactoryCanvas({ shot = 0, className, onLabels, onReady, ariaLabel }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<FactoryShowcase | null>(null);
  const shotRef = useRef(shot);
  const cbRef = useRef({ onLabels, onReady });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    cbRef.current = { onLabels, onReady };
  });

  useEffect(() => {
    shotRef.current = shot;
    sceneRef.current?.setShot(shot);
  }, [shot]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    let cancelled = false;
    let inView = false;
    let ro: ResizeObserver | null = null;

    const sync = () => {
      const s = sceneRef.current;
      if (!s) return;
      if (inView && document.visibilityState === "visible") s.start();
      else s.stop();
    };

    const init = async () => {
      performance.mark("lgf3d:import");
      const { FactoryShowcase } = await import("./factory3d/showcase");
      performance.mark("lgf3d:loaded");
      if (cancelled) return;
      // 让标题先画出来、等浏览器空闲再建模型（建模会占用主线程几百毫秒，手机上更久）
      await new Promise<void>((r) =>
        "requestIdleCallback" in window ? requestIdleCallback(() => r(), { timeout: 900 }) : setTimeout(r, 150),
      );
      if (cancelled) return;
      let scene: FactoryShowcase;
      try {
        scene = new FactoryShowcase(canvas, {
          reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
          onLabels: (p) => cbRef.current.onLabels?.(p),
          onReady: () => {
            performance.mark("lgf3d:ready");
            setReady(true);
            cbRef.current.onReady?.();
          },
        });
      } catch {
        return; // 没有 WebGL：留着背景，不显示 3D
      }
      performance.mark("lgf3d:built");
      sceneRef.current = scene;
      scene.setShot(shotRef.current);
      const r = wrap.getBoundingClientRect();
      scene.resize(r.width, r.height);
      ro = new ResizeObserver(([e]) => scene.resize(e.contentRect.width, e.contentRect.height));
      ro.observe(wrap);
      sync();
    };

    // 提前一屏开始加载
    let started = false;
    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started) {
          started = true;
          near.disconnect();
          void init();
        }
      },
      { rootMargin: "100% 0px" },
    );
    near.observe(wrap);

    const vis = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      sync();
    });
    vis.observe(wrap);
    document.addEventListener("visibilitychange", sync);

    return () => {
      cancelled = true;
      near.disconnect();
      vis.disconnect();
      ro?.disconnect();
      document.removeEventListener("visibilitychange", sync);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  return (
    <div ref={wrapRef} className={className} role="img" aria-label={ariaLabel}>
      {/* 加载中：中间一个小菊花 */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`}
      >
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-ink/10 border-t-ink/40" />
      </div>
      <canvas
        ref={canvasRef}
        className="block h-full w-full transition-opacity duration-[1800ms] ease-out"
        style={{ opacity: ready ? 1 : 0, touchAction: "pan-y" }}
      />
    </div>
  );
}
