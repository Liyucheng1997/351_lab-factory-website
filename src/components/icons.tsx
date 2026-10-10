// 细线图标（和系统一样的 1.6 线宽，颜色跟随文字）
type P = { className?: string };
const base = {
  width: 28,
  height: 28,
  viewBox: "0 0 28 28",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** 剪刀：全部自己做 */
export const IconScissors = ({ className }: P) => (
  <svg {...base} className={className}>
    <circle cx="7" cy="20" r="3" />
    <circle cx="7" cy="8" r="3" />
    <path d="M9.6 18.4L24 7M9.6 9.6L24 21" />
  </svg>
);
/** 二维码：每件可追溯 */
export const IconQR = ({ className }: P) => (
  <svg {...base} className={className}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="17" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="17" width="7" height="7" rx="1.5" />
    <path d="M17 17h3v3M24 17v0M17 24h7v-4M20.5 20.5v0" />
  </svg>
);
/** 盾牌：透明供应链 */
export const IconShield = ({ className }: P) => (
  <svg {...base} className={className}>
    <path d="M14 3.5l8.5 3.5v6.5c0 5.5-3.7 9.6-8.5 11.5-4.8-1.9-8.5-6-8.5-11.5V7z" />
    <path d="M10.5 14l2.5 2.5 4.5-5" />
  </svg>
);
