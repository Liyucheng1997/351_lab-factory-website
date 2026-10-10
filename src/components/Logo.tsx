import { COMPANY } from "@/content/company";

/** 文字标志：LGF + 城市名（和系统一样用系统字体） */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="text-[1.15rem] font-semibold tracking-[-0.01em]">{COMPANY.brand}</span>
      <span className="text-[0.8rem] text-ink-3">{COMPANY.city}</span>
    </span>
  );
}
