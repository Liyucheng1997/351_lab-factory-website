// 公司资料：网站上所有的公司信息都从这里读。
// 空字符串 = 网站上不显示这一项。上线前把 TODO 的几项填成真实信息。
export const COMPANY = {
  brand: "LGF",
  legalName: "L.G.F. S.r.l.",
  city: "Reggio Emilia",
  province: "RE",
  region: "Emilia-Romagna",
  country: "IT",

  // TODO 上线前填写
  street: "", // 例：Via Emilia all'Angelo 12
  postalCode: "", // 例：42124
  vat: "", // P.IVA，例：IT01234567890
  email: "", // 例：info@lgf-srl.it（联系表单发不出去时，会让客户直接写这个邮箱）
  phone: "", // 例：+39 0522 123456
  whatsapp: "", // 例：+39 333 1234567（只填数字和 +）
  hours: "", // 例：Lun – Ven · 8:00 – 12:00 / 13:30 – 18:00

  // 工厂数字（网站上的大数字）
  areaM2: 2000,
  people: 15,

  // 地图链接用的搜索词：填了街道以后会自动用完整地址
  mapsQuery: "Reggio Emilia, Italia",
};

/** 网站完整地址（含 GitHub Pages 的子路径），例：https://liyucheng1997.github.io/351_lab-factory-website */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
/** 站内绝对地址（分享卡片、sitemap 用） */
export const absUrl = (path: string) => `${SITE_URL}/${path.replace(/^\//, "")}`;
/** 询价表单接收地址（Formspree 等）；空 = 打开访客的邮件程序 */
export const FORM_ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT || "";

export function fullAddress() {
  const line2 = [COMPANY.postalCode, COMPANY.city, COMPANY.province ? `(${COMPANY.province})` : ""].filter(Boolean).join(" ");
  return [COMPANY.street, line2].filter(Boolean).join(", ");
}

export function mapsUrl() {
  const q = COMPANY.street ? `${COMPANY.legalName}, ${fullAddress()}` : COMPANY.mapsQuery;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/** 合作品牌：网站上用统一的衬线大写字排出来（不放品牌 Logo 图片） */
export const CLIENTS = ["PINKO", "MAX MARA", "PEPE"];
