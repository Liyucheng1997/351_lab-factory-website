import { notFound } from "next/navigation";
import { Contact } from "@/components/Contact";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { RevealObserver } from "@/components/Reveal";
import { About, Footer } from "@/components/sections";
import { getDict, hasLocale } from "@/content/i18n";

// 一共三屏：3D 工厂 → 为什么选我们 → 联系
export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDict(lang);
  return (
    <>
      <Header t={t} lang={lang} />
      <main id="main">
        <Hero t={t} />
        <About t={t} />
        <Contact t={t} lang={lang} />
      </main>
      <Footer t={t} lang={lang} />
      <RevealObserver />
    </>
  );
}
